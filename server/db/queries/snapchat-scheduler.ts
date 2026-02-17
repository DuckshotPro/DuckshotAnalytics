/**
 * Snapchat Scheduler Database Queries
 * 
 * Utility functions for interacting with the Snapchat scheduler database tables.
 * Provides type-safe queries using Drizzle ORM.
 */

import { eq, and, or, lte, gte, desc, asc, sql } from "drizzle-orm";
import { db } from "../../db";
import {
    snapchatScheduledContent,
    snapchatPublishLog,
    snapchatSchedulerAnalytics,
    type InsertSnapchatScheduledContent,
    type UpdateSnapchatScheduledContent,
    type InsertSnapchatPublishLog,
    ScheduledContentStatus,
} from "@shared/schema";

// ===================================
// Scheduled Content Queries
// ===================================

/**
 * Get all scheduled posts for a specific user
 * @param userId - The user ID
 * @param filters - Optional filters (status, dateRange)
 * @returns Array of scheduled content
 */
export async function getScheduledPostsByUser(
    userId: number,
    filters?: {
        status?: string;
        startDate?: Date;
        endDate?: Date;
    }
) {
    const conditions = [eq(snapchatScheduledContent.userId, userId)];

    if (filters?.status) {
        conditions.push(eq(snapchatScheduledContent.status, filters.status));
    }

    if (filters?.startDate) {
        conditions.push(gte(snapchatScheduledContent.scheduledFor, filters.startDate));
    }

    if (filters?.endDate) {
        conditions.push(lte(snapchatScheduledContent.scheduledFor, filters.endDate));
    }

    return await db
        .select()
        .from(snapchatScheduledContent)
        .where(and(...conditions))
        .orderBy(asc(snapchatScheduledContent.scheduledFor));
}

/**
 * Get active recurring posts (scheduled or recently published)
 * @param days - Number of days to look back for published posts (default: 90)
 * @returns Array of recurring scheduled content
 */
export async function getRecurringPosts(days: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await db
        .select()
        .from(snapchatScheduledContent)
        .where(
            and(
                eq(snapchatScheduledContent.isRecurring, true),
                or(
                    eq(snapchatScheduledContent.status, ScheduledContentStatus.SCHEDULED),
                    and(
                        eq(snapchatScheduledContent.status, ScheduledContentStatus.PUBLISHED),
                        gte(snapchatScheduledContent.scheduledFor, cutoffDate)
                    )
                )
            )
        )
        .orderBy(desc(snapchatScheduledContent.scheduledFor));
}

/**
 * Get posts that are due for publishing (scheduled time has passed)
 * @param limit - Maximum number of posts to retrieve
 * @returns Array of posts ready to publish
 */
export async function getDuePosts(limit: number = 50) {
    return await db
        .select()
        .from(snapchatScheduledContent)
        .where(
            and(
                eq(snapchatScheduledContent.status, ScheduledContentStatus.SCHEDULED),
                lte(snapchatScheduledContent.scheduledFor, new Date())
            )
        )
        .orderBy(asc(snapchatScheduledContent.scheduledFor))
        .limit(limit);
}

/**
 * Get a single scheduled post by ID
 * @param postId - The post ID
 * @returns Scheduled post or undefined
 */
export async function getPostById(postId: number) {
    const result = await db
        .select()
        .from(snapchatScheduledContent)
        .where(eq(snapchatScheduledContent.id, postId))
        .limit(1);

    return result[0];
}

/**
 * Create a new scheduled post
 * @param data - Post data
 * @returns Created post
 */
export async function createScheduledPost(data: InsertSnapchatScheduledContent) {
    const result = await db
        .insert(snapchatScheduledContent)
        .values(data)
        .returning();

    return result[0];
}

/**
 * Update a scheduled post
 * @param postId - The post ID
 * @param updates - Fields to update
 * @returns Updated post
 */
export async function updateScheduledPost(
    postId: number,
    updates: UpdateSnapchatScheduledContent
) {
    const result = await db
        .update(snapchatScheduledContent)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(snapchatScheduledContent.id, postId))
        .returning();

    return result[0];
}

/**
 * Update post status
 * @param postId - The post ID
 * @param status - New status
 * @param additionalData - Optional additional fields to update
 * @returns Updated post
 */
export async function updatePostStatus(
    postId: number,
    status: string,
    additionalData?: {
        publishedAt?: Date;
        failureReason?: string;
        retryCount?: number;
    }
) {
    const result = await db
        .update(snapchatScheduledContent)
        .set({
            status,
            ...additionalData,
            updatedAt: new Date(),
        })
        .where(eq(snapchatScheduledContent.id, postId))
        .returning();

    return result[0];
}

/**
 * Delete a scheduled post
 * @param postId - The post ID
 * @returns Deleted post
 */
export async function deleteScheduledPost(postId: number) {
    const result = await db
        .delete(snapchatScheduledContent)
        .where(eq(snapchatScheduledContent.id, postId))
        .returning();

    return result[0];
}

/**
 * Increment retry count for a post
 * @param postId - The post ID
 * @returns Updated post
 */
export async function incrementRetryCount(postId: number) {
    const post = await getPostById(postId);

    if (!post) {
        throw new Error(`Post ${postId} not found`);
    }

    const newRetryCount = post.retryCount + 1;

    return await updateScheduledPost(postId, {
        retryCount: newRetryCount,
        status: newRetryCount >= post.maxRetries
            ? ScheduledContentStatus.FAILED
            : ScheduledContentStatus.SCHEDULED,
    } as any);
}

// ===================================
// Publish Log Queries
// ===================================

/**
 * Create a publish log entry
 * @param data - Log data
 * @returns Created log entry
 */
export async function createPublishLog(data: InsertSnapchatPublishLog) {
    const result = await db
        .insert(snapchatPublishLog)
        .values(data)
        .returning();

    return result[0];
}

/**
 * Get publish logs for a specific post
 * @param scheduledContentId - The scheduled content ID
 * @returns Array of publish log entries
 */
export async function getPublishLogsByPost(scheduledContentId: number) {
    return await db
        .select()
        .from(snapchatPublishLog)
        .where(eq(snapchatPublishLog.scheduledContentId, scheduledContentId))
        .orderBy(desc(snapchatPublishLog.attemptedAt));
}

/**
 * Get recent publish logs for a user
 * @param userId - The user ID
 * @param limit - Maximum number of logs to retrieve
 * @returns Array of publish logs with post details
 */
export async function getRecentPublishLogs(userId: number, limit: number = 50) {
    return await db
        .select({
            log: snapchatPublishLog,
            post: snapchatScheduledContent,
        })
        .from(snapchatPublishLog)
        .innerJoin(
            snapchatScheduledContent,
            eq(snapchatPublishLog.scheduledContentId, snapchatScheduledContent.id)
        )
        .where(eq(snapchatScheduledContent.userId, userId))
        .orderBy(desc(snapchatPublishLog.attemptedAt))
        .limit(limit);
}

// ===================================
// Analytics Queries
// ===================================

/**
 * Get scheduler analytics for a user
 * @param userId - The user ID
 * @param periodStart - Start of analytics period
 * @param periodEnd - End of analytics period
 * @returns Analytics data or undefined
 */
export async function getSchedulerAnalytics(
    userId: number,
    periodStart: Date,
    periodEnd: Date
) {
    const result = await db
        .select()
        .from(snapchatSchedulerAnalytics)
        .where(
            and(
                eq(snapchatSchedulerAnalytics.userId, userId),
                eq(snapchatSchedulerAnalytics.periodStart, periodStart),
                eq(snapchatSchedulerAnalytics.periodEnd, periodEnd)
            )
        )
        .limit(1);

    return result[0];
}

/**
 * Calculate and update analytics for a user
 * @param userId - The user ID
 * @param periodStart - Start of analytics period
 * @param periodEnd - End of analytics period
 * @returns Updated analytics
 */
export async function calculateAndUpdateAnalytics(
    userId: number,
    periodStart: Date,
    periodEnd: Date
) {
    // Get counts for the period
    const scheduled = await db
        .select({ count: sql<number>`count(*)` })
        .from(snapchatScheduledContent)
        .where(
            and(
                eq(snapchatScheduledContent.userId, userId),
                gte(snapchatScheduledContent.createdAt, periodStart),
                lte(snapchatScheduledContent.createdAt, periodEnd)
            )
        );

    const published = await db
        .select({ count: sql<number>`count(*)` })
        .from(snapchatScheduledContent)
        .where(
            and(
                eq(snapchatScheduledContent.userId, userId),
                eq(snapchatScheduledContent.status, ScheduledContentStatus.PUBLISHED),
                gte(snapchatScheduledContent.publishedAt, periodStart),
                lte(snapchatScheduledContent.publishedAt, periodEnd)
            )
        );

    const failed = await db
        .select({ count: sql<number>`count(*)` })
        .from(snapchatScheduledContent)
        .where(
            and(
                eq(snapchatScheduledContent.userId, userId),
                eq(snapchatScheduledContent.status, ScheduledContentStatus.FAILED),
                gte(snapchatScheduledContent.updatedAt, periodStart),
                lte(snapchatScheduledContent.updatedAt, periodEnd)
            )
        );

    const totalScheduled = Number(scheduled[0]?.count || 0);
    const totalPublished = Number(published[0]?.count || 0);
    const totalFailed = Number(failed[0]?.count || 0);
    const successRate = totalScheduled > 0
        ? Math.round((totalPublished / totalScheduled) * 100)
        : 0;

    // Upsert analytics
    const existing = await getSchedulerAnalytics(userId, periodStart, periodEnd);

    if (existing) {
        const result = await db
            .update(snapchatSchedulerAnalytics)
            .set({
                totalScheduled,
                totalPublished,
                totalFailed,
                successRate,
                updatedAt: new Date(),
            })
            .where(eq(snapchatSchedulerAnalytics.id, existing.id))
            .returning();

        return result[0];
    } else {
        const result = await db
            .insert(snapchatSchedulerAnalytics)
            .values({
                userId,
                totalScheduled,
                totalPublished,
                totalFailed,
                successRate,
                periodStart,
                periodEnd,
            })
            .returning();

        return result[0];
    }
}

/**
 * Get posting statistics for a user (for dashboard)
 * @param userId - The user ID
 * @returns Statistics object
 */
export async function getPostingStats(userId: number) {
    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 24 * 60 * 60 * 1000);

    const [counts, queueCount] = await Promise.all([
        db
            .select({
                status: snapchatScheduledContent.status,
                count: sql<number>`count(*)`,
            })
            .from(snapchatScheduledContent)
            .where(eq(snapchatScheduledContent.userId, userId))
            .groupBy(snapchatScheduledContent.status),

        db
            .select({ count: sql<number>`count(*)` })
            .from(snapchatScheduledContent)
            .where(
                and(
                    eq(snapchatScheduledContent.userId, userId),
                    eq(snapchatScheduledContent.status, ScheduledContentStatus.SCHEDULED),
                    lte(snapchatScheduledContent.scheduledFor, fortyEightHoursFromNow)
                )
            ),
    ]);

    const statsMap: Record<string, number> = {};
    counts.forEach((row: { status: string; count: number }) => {
        statsMap[row.status] = Number(row.count);
    });

    const successCount = statsMap[ScheduledContentStatus.PUBLISHED] || 0;
    const failCount = statsMap[ScheduledContentStatus.FAILED] || 0;
    const pendingCount = statsMap[ScheduledContentStatus.SCHEDULED] || 0;
    const total = successCount + failCount + pendingCount;

    return {
        successCount,
        failCount,
        pendingCount,
        successRate: total > 0 ? Math.round((successCount / (successCount + failCount)) * 100) : 0,
        queueCount: Number(queueCount[0]?.count || 0),
        errorCount: failCount,
    };
}

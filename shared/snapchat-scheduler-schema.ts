/**
 * Snapchat Scheduler Schema Definition
 * 
 * This file defines the database schema for the Snapchat scheduled content upload feature.
 * It includes tables for scheduled content, publish logs, and related functionality.
 */

import { pgTable, text, serial, integer, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

/**
 * Snapchat Scheduled Content Table
 * 
 * Stores scheduled posts for future publication to Snapchat:
 * - Content details (media, caption, type)
 * - Schedule information (time, timezone, recurring)
 * - Status tracking (draft, scheduled, publishing, published, failed)
 * - Retry management
 */
export const snapchatScheduledContent = pgTable("snapchat_scheduled_content", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    snapchatAccountId: text("snapchat_account_id").notNull(),

    // Content Details
    contentType: text("content_type").notNull(), // 'image', 'video', 'story'
    mediaUrl: text("media_url").notNull(), // S3/Storage URL to the media file
    thumbnailUrl: text("thumbnail_url"), // URL to generated thumbnail
    caption: text("caption"), // Post caption/text
    duration: integer("duration"), // Duration in seconds (for videos)

    // Scheduling
    scheduledFor: timestamp("scheduled_for").notNull(), // When to publish (UTC)
    timezone: text("timezone").default("UTC"), // User's timezone for reference
    isRecurring: boolean("is_recurring").default(false), // Is this a recurring post?
    recurringPattern: jsonb("recurring_pattern"), // {frequency: 'daily', interval: 1, endDate: '...'}

    // Status Management
    status: text("status").default("scheduled").notNull(),
    // Status options: 'draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled'
    publishedAt: timestamp("published_at"), // When the post was successfully published
    failureReason: text("failure_reason"), // Error message if publish failed
    retryCount: integer("retry_count").default(0).notNull(), // Number of retry attempts
    maxRetries: integer("max_retries").default(3).notNull(), // Maximum retry attempts before giving up

    // Metadata
    metadata: jsonb("metadata"), // Additional Snapchat API fields (location, hashtags, etc.)
    createdAt: timestamp("created_at").defaultNow().notNull(), // When the scheduled post was created
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // When the scheduled post was last updated
}, (table) => ({
    // Index for fetching user's scheduled posts (most common query)
    userIdIdx: index("snapchat_scheduled_content_user_id_idx").on(table.userId),

    // Composite index for fetching posts due for publishing
    statusScheduledForIdx: index("snapchat_scheduled_content_status_scheduled_for_idx")
        .on(table.status, table.scheduledFor),

    // Composite index for user's posts by status and schedule time
    userStatusScheduledIdx: index("snapchat_scheduled_content_user_status_scheduled_idx")
        .on(table.userId, table.status, table.scheduledFor),

    // Index for account-specific queries
    accountIdIdx: index("snapchat_scheduled_content_account_id_idx").on(table.snapchatAccountId),
}));

/**
 * Snapchat Publish Log Table
 * 
 * Tracks all publishing attempts for scheduled content:
 * - Maintains audit trail of each publish attempt
 * - Stores success/failure status
 * - Records Snapchat API responses
 * - Used for debugging and analytics
 */
export const snapchatPublishLog = pgTable("snapchat_publish_log", {
    id: serial("id").primaryKey(),
    scheduledContentId: integer("scheduled_content_id")
        .notNull()
        .references(() => snapchatScheduledContent.id, { onDelete: "cascade" }),

    attemptedAt: timestamp("attempted_at").defaultNow().notNull(), // When the publish was attempted
    status: text("status").notNull(), // 'success', 'failed', 'retrying'
    snapchatPostId: text("snapchat_post_id"), // Post ID from Snapchat API (on success)
    errorMessage: text("error_message"), // Error message if failed
    errorCode: text("error_code"), // Error code from Snapchat API
    responseData: jsonb("response_data"), // Full API response for debugging
}, (table) => ({
    // Index for fetching logs by scheduled content
    scheduledContentIdIdx: index("snapchat_publish_log_scheduled_content_id_idx")
        .on(table.scheduledContentId),

    // Index for chronological queries
    attemptedAtIdx: index("snapchat_publish_log_attempted_at_idx").on(table.attemptedAt),

    // Index for filtering by status
    statusIdx: index("snapchat_publish_log_status_idx").on(table.status),
}));

/**
 * Snapchat Scheduler Analytics Table
 * 
 * Stores aggregated analytics for the scheduler feature:
 * - Track user engagement with scheduling
 * - Optimal posting time analysis
 * - Success/failure rates
 */
export const snapchatSchedulerAnalytics = pgTable("snapchat_scheduler_analytics", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

    // Metrics
    totalScheduled: integer("total_scheduled").default(0).notNull(), // Total posts scheduled
    totalPublished: integer("total_published").default(0).notNull(), // Total successfully published
    totalFailed: integer("total_failed").default(0).notNull(), // Total failed
    successRate: integer("success_rate").default(0).notNull(), // Success percentage (0-100)

    // Timing Analysis
    optimalPostingTimes: jsonb("optimal_posting_times"), // [{hour: 18, day: 'monday', avgEngagement: 1500}]

    // Timestamps
    periodStart: timestamp("period_start").notNull(), // Start of analytics period
    periodEnd: timestamp("period_end").notNull(), // End of analytics period
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===================================
// Zod Schemas for Validation
// ===================================

/**
 * Schema for creating a new scheduled post
 */
export const insertSnapchatScheduledContentSchema = createInsertSchema(snapchatScheduledContent).pick({
    userId: true,
    snapchatAccountId: true,
    contentType: true,
    mediaUrl: true,
    thumbnailUrl: true,
    caption: true,
    duration: true,
    scheduledFor: true,
    timezone: true,
    isRecurring: true,
    recurringPattern: true,
    metadata: true,
});

/**
 * Schema for updating a scheduled post
 */
export const updateSnapchatScheduledContentSchema = createInsertSchema(snapchatScheduledContent).pick({
    caption: true,
    scheduledFor: true,
    timezone: true,
    status: true,
    metadata: true,
}).partial();

/**
 * Schema for creating a publish log entry
 */
export const insertSnapchatPublishLogSchema = createInsertSchema(snapchatPublishLog).pick({
    scheduledContentId: true,
    status: true,
    snapchatPostId: true,
    errorMessage: true,
    errorCode: true,
    responseData: true,
});

/**
 * Schema for updating scheduler analytics
 */
export const insertSnapchatSchedulerAnalyticsSchema = createInsertSchema(snapchatSchedulerAnalytics);

// ===================================
// TypeScript Type Definitions
// ===================================

export type SnapchatScheduledContent = typeof snapchatScheduledContent.$inferSelect;
export type InsertSnapchatScheduledContent = z.infer<typeof insertSnapchatScheduledContentSchema>;
export type UpdateSnapchatScheduledContent = z.infer<typeof updateSnapchatScheduledContentSchema>;

export type SnapchatPublishLog = typeof snapchatPublishLog.$inferSelect;
export type InsertSnapchatPublishLog = z.infer<typeof insertSnapchatPublishLogSchema>;

export type SnapchatSchedulerAnalytics = typeof snapchatSchedulerAnalytics.$inferSelect;
export type InsertSnapchatSchedulerAnalytics = z.infer<typeof insertSnapchatSchedulerAnalyticsSchema>;

// ===================================
// Enums for Type Safety
// ===================================

export const ContentType = {
    IMAGE: "image",
    VIDEO: "video",
    STORY: "story",
} as const;

export const ScheduledContentStatus = {
    DRAFT: "draft",
    SCHEDULED: "scheduled",
    PUBLISHING: "publishing",
    PUBLISHED: "published",
    FAILED: "failed",
    CANCELLED: "cancelled",
} as const;

export const PublishLogStatus = {
    SUCCESS: "success",
    FAILED: "failed",
    RETRYING: "retrying",
} as const;

export type ContentTypeValue = typeof ContentType[keyof typeof ContentType];
export type ScheduledContentStatusValue = typeof ScheduledContentStatus[keyof typeof ScheduledContentStatus];
export type PublishLogStatusValue = typeof PublishLogStatus[keyof typeof PublishLogStatus];

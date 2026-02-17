/**
 * Scheduler Analytics Service
 * 
 * Tracks and analyzes Snapchat scheduler performance metrics.
 * Integrates with existing analytics system.
 */

import {
    calculateAndUpdateAnalytics,
    getSchedulerAnalytics,
    getPostingStats,
} from "../db/queries/snapchat-scheduler";
import { logger } from "../logger";

/**
 * Analytics time periods
 */
export enum AnalyticsPeriod {
    TODAY = "today",
    WEEK = "week",
    MONTH = "month",
    ALL_TIME = "all_time",
}

/**
 * Get period date range
 */
function getPeriodRange(period: AnalyticsPeriod): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    let start: Date;

    switch (period) {
        case AnalyticsPeriod.TODAY:
            start = new Date(now);
            start.setHours(0, 0, 0, 0);
            break;

        case AnalyticsPeriod.WEEK:
            start = new Date(now);
            start.setDate(now.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            break;

        case AnalyticsPeriod.MONTH:
            start = new Date(now);
            start.setMonth(now.getMonth() - 1);
            start.setHours(0, 0, 0, 0);
            break;

        case AnalyticsPeriod.ALL_TIME:
            start = new Date(0); // Unix epoch
            break;
    }

    return { start, end };
}

/**
 * Get scheduler analytics for a user
 */
export async function getUserAnalytics(
    userId: number,
    period: AnalyticsPeriod = AnalyticsPeriod.MONTH
) {
    try {
        const { start, end } = getPeriodRange(period);

        // Get or calculate analytics
        let analytics = await getSchedulerAnalytics(userId, start, end);

        if (!analytics) {
            // Calculate and create analytics
            analytics = await calculateAndUpdateAnalytics(userId, start, end);
        }

        // Get current posting stats
        const stats = await getPostingStats(userId);

        return {
            period,
            dateRange: { start, end },
            analytics: {
                totalScheduled: analytics.totalScheduled,
                totalPublished: analytics.totalPublished,
                totalFailed: analytics.totalFailed,
                successRate: analytics.successRate,
                optimalPostingTimes: analytics.optimalPostingTimes || [],
            },
            currentStats: stats,
        };
    } catch (error: any) {
        logger.error(`Error fetching analytics for user ${userId}:`, error);
        throw error;
    }
}

/**
 * Calculate optimal posting times based on historical data
 */
export async function calculateOptimalPostingTimes(userId: number): Promise<Array<{
    hour: number;
    successRate: number;
    avgEngagement?: number;
}>> {
    // This would analyze historical publish times and success rates
    // For now, return mock data based on general best practices

    return [
        { hour: 9, successRate: 95 },   // 9 AM
        { hour: 12, successRate: 92 },  // 12 PM
        { hour: 17, successRate: 96 },  // 5 PM
        { hour: 20, successRate: 94 },  // 8 PM
    ];
}

/**
 * Get engagement trends over time
 */
export async function getEngagementTrends(
    userId: number,
    period: AnalyticsPeriod = AnalyticsPeriod.MONTH
): Promise<Array<{
    date: string;
    scheduled: number;
    published: number;
    failed: number;
}>> {
    const { start, end } = getPeriodRange(period);

    // This would query the database for daily/weekly trends
    // For now, return mock trend data

    const trends: Array<{ date: string; scheduled: number; published: number; failed: number }> = [];
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < Math.min(daysDiff, 30); i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);

        trends.push({
            date: date.toISOString().split('T')[0],
            scheduled: Math.floor(Math.random() * 10) + 1,
            published: Math.floor(Math.random() * 8) + 1,
            failed: Math.floor(Math.random() * 2),
        });
    }

    return trends;
}

/**
 * Get performance comparison
 */
export async function getPerformanceComparison(userId: number): Promise<{
    thisWeek: { scheduled: number; published: number; successRate: number };
    lastWeek: { scheduled: number; published: number; successRate: number };
    change: { scheduled: number; published: number; successRate: number };
}> {
    const now = new Date();

    // This week
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);

    const thisWeekAnalytics = await calculateAndUpdateAnalytics(
        userId,
        thisWeekStart,
        now
    );

    // Last week
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 14);

    const lastWeekEnd = new Date(now);
    lastWeekEnd.setDate(now.getDate() - 7);

    const lastWeekAnalytics = await calculateAndUpdateAnalytics(
        userId,
        lastWeekStart,
        lastWeekEnd
    );

    return {
        thisWeek: {
            scheduled: thisWeekAnalytics.totalScheduled,
            published: thisWeekAnalytics.totalPublished,
            successRate: thisWeekAnalytics.successRate,
        },
        lastWeek: {
            scheduled: lastWeekAnalytics.totalScheduled,
            published: lastWeekAnalytics.totalPublished,
            successRate: lastWeekAnalytics.successRate,
        },
        change: {
            scheduled: thisWeekAnalytics.totalScheduled - lastWeekAnalytics.totalScheduled,
            published: thisWeekAnalytics.totalPublished - lastWeekAnalytics.totalPublished,
            successRate: thisWeekAnalytics.successRate - lastWeekAnalytics.successRate,
        },
    };
}

/**
 * Get scheduler health metrics
 */
export async function getSchedulerHealth(userId: number): Promise<{
    status: "healthy" | "warning" | "critical";
    issues: string[];
    recommendations: string[];
}> {
    const stats = await getPostingStats(userId);
    const issues: string[] = [];
    const recommendations: string[] = [];

    let status: "healthy" | "warning" | "critical" = "healthy";

    // Check success rate
    if (stats.successRate < 50) {
        status = "critical";
        issues.push("Very low success rate (< 50%)");
        recommendations.push("Check Snapchat API credentials and token expiration");
    } else if (stats.successRate < 80) {
        status = "warning";
        issues.push("Low success rate (< 80%)");
        recommendations.push("Review failed posts and common error patterns");
    }

    // Check for scheduled posts
    if (stats.totalScheduled === 0) {
        if (status === "healthy") status = "warning";
        issues.push("No posts currently scheduled");
        recommendations.push("Schedule posts to maintain consistent publishing");
    }

    // Add positive recommendations
    if (status === "healthy") {
        recommendations.push("Scheduler is performing well");
        recommendations.push("Consider using recurring posts for consistent content");
    }

    return { status, issues, recommendations };
}

export const SchedulerAnalyticsService = {
    getUserAnalytics,
    calculateOptimalPostingTimes,
    getEngagementTrends,
    getPerformanceComparison,
    getSchedulerHealth,
};

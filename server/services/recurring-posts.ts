/**
 * Recurring Posts Handler
 * 
 * Manages recurring scheduled posts - creates future instances based on patterns.
 * Handles daily, weekly, monthly, and custom recurring schedules.
 */

import {
    createScheduledPost,
    getScheduledPostsByUser,
    updateScheduledPost,
    getRecurringPosts,
} from "../db/queries/snapchat-scheduler";
import { type InsertSnapchatScheduledContent, ScheduledContentStatus, type SnapchatScheduledContent } from "@shared/schema";
import { logger } from "../logger";

/**
 * Recurring pattern configuration
 */
export interface RecurringPattern {
    frequency: "daily" | "weekly" | "monthly" | "custom";
    interval: number; // e.g., 1 = every day, 2 = every 2 days
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) for weekly
    dayOfMonth?: number; // 1-31 for monthly
    endDate?: string; // ISO date string
    maxOccurrences?: number; // Alternative to endDate
}

/**
 * Calculate next occurrence date based on recurring pattern
 */
export function calculateNextOccurrence(
    currentDate: Date,
    pattern: RecurringPattern
): Date | null {
    const next = new Date(currentDate);

    // Check if we've reached the end date
    if (pattern.endDate) {
        const endDate = new Date(pattern.endDate);
        if (next >= endDate) {
            return null;
        }
    }

    switch (pattern.frequency) {
        case "daily":
            next.setDate(next.getDate() + pattern.interval);
            break;

        case "weekly":
            if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
                // Find next matching day of week
                const currentDay = next.getDay();
                const sortedDays = [...pattern.daysOfWeek].sort((a, b) => a - b);

                // Find next day in the array
                let nextDay = sortedDays.find(day => day > currentDay);

                if (nextDay !== undefined) {
                    // Next occurrence is this week
                    next.setDate(next.getDate() + (nextDay - currentDay));
                } else {
                    // Next occurrence is next week
                    const firstDay = sortedDays[0];
                    const daysUntilNext = 7 - currentDay + firstDay;
                    next.setDate(next.getDate() + daysUntilNext);
                }

                // Apply interval (number of weeks)
                if (pattern.interval > 1) {
                    next.setDate(next.getDate() + (pattern.interval - 1) * 7);
                }
            } else {
                // Default: same day next week(s)
                next.setDate(next.getDate() + (pattern.interval * 7));
            }
            break;

        case "monthly":
            if (pattern.dayOfMonth) {
                next.setMonth(next.getMonth() + pattern.interval);
                next.setDate(pattern.dayOfMonth);
            } else {
                // Default: same day next month(s)
                next.setMonth(next.getMonth() + pattern.interval);
            }
            break;

        case "custom":
            // Custom pattern - application specific
            // Could be based on metadata or custom logic
            next.setDate(next.getDate() + pattern.interval);
            break;
    }

    // Check end date again after calculation
    if (pattern.endDate) {
        const endDate = new Date(pattern.endDate);
        if (next >= endDate) {
            return null;
        }
    }

    return next;
}

/**
 * Generate future occurrences for a recurring post
 */
export function generateOccurrences(
    startDate: Date,
    pattern: RecurringPattern,
    maxGenerate: number = 10
): Date[] {
    const occurrences: Date[] = [];
    let currentDate = new Date(startDate);
    let count = 0;

    while (count < maxGenerate) {
        const nextDate = calculateNextOccurrence(currentDate, pattern);

        if (!nextDate) {
            break; // Reached end date or max occurrences
        }

        // Check maxOccurrences limit
        if (pattern.maxOccurrences && count >= pattern.maxOccurrences) {
            break;
        }

        occurrences.push(nextDate);
        currentDate = nextDate;
        count++;
    }

    return occurrences;
}

/**
 * Create recurring post instances
 */
export async function createRecurringInstances(
    templatePost: InsertSnapchatScheduledContent,
    pattern: RecurringPattern,
    maxInstances: number = 4 // Create next 4 instances by default
): Promise<number[]> {
    try {
        const startDate = new Date(templatePost.scheduledFor);
        const occurrences = generateOccurrences(startDate, pattern, maxInstances);

        logger.info(`Creating ${occurrences.length} recurring instances`);

        const createdIds: number[] = [];

        for (const occurDate of occurrences) {
            // Create a new post for each occurrence
            const newPost = await createScheduledPost({
                ...templatePost,
                scheduledFor: occurDate,
                isRecurring: true,
                recurringPattern: pattern,
                status: ScheduledContentStatus.SCHEDULED,
            });

            createdIds.push(newPost.id);

            logger.debug(`Created recurring instance ${newPost.id} for ${occurDate.toISOString()}`);
        }

        return createdIds;
    } catch (error: any) {
        logger.error("Error creating recurring instances:", error);
        throw error;
    }
}

/**
 * Process recurring posts - create future instances as needed
 */
export async function processRecurringPosts(): Promise<{
    processed: number;
    created: number;
}> {
    try {
        logger.info("Processing recurring posts...");

        let totalProcessed = 0;
        let totalCreated = 0;

        // Query database for active recurring posts (scheduled or recently published)
        const recurringPosts = await getRecurringPosts(90); // 90 day lookback

        // Group posts into chains by identity
        const chains = new Map<string, SnapchatScheduledContent[]>();

        for (const post of recurringPosts) {
            // Create a stable identity key for the recurring chain
            const patternKey = post.recurringPattern ?
                Object.keys(post.recurringPattern as object).sort().map(k => `${k}:${(post.recurringPattern as any)[k]}`).join(',') :
                'no-pattern';

            const key = `${post.userId}|${post.snapchatAccountId}|${post.contentType}|${post.mediaUrl}|${post.caption || ''}|${patternKey}`;

            if (!chains.has(key)) {
                chains.set(key, []);
            }
            chains.get(key)!.push(post);
        }

        totalProcessed = chains.size;

        // Process each chain to see if it needs new instances
        for (const [key, posts] of chains.entries()) {
            // Posts are already sorted by scheduledFor descending from the query
            const latestPost = posts[0];

            // Check if there are any upcoming scheduled instances
            const hasScheduled = posts.some(p => p.status === ScheduledContentStatus.SCHEDULED);

            if (!hasScheduled && latestPost.status === ScheduledContentStatus.PUBLISHED) {
                // If no scheduled instances exist and the latest was published, create more
                const createdIds = await createRecurringInstances(
                    latestPost as any,
                    latestPost.recurringPattern as RecurringPattern
                );
                totalCreated += createdIds.length;
                logger.info(`Created ${createdIds.length} new instances for chain ${key}`);
            }
        }

        logger.info(`Recurring posts: Processed ${totalProcessed} chains, created ${totalCreated} new instances`);

        return {
            processed: totalProcessed,
            created: totalCreated,
        };
    } catch (error: any) {
        logger.error("Error processing recurring posts:", error);
        throw error;
    }
}

/**
 * Validate recurring pattern
 */
export function validateRecurringPattern(pattern: RecurringPattern): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Validate interval
    if (pattern.interval < 1) {
        errors.push("Interval must be at least 1");
    }

    // Validate frequency-specific rules
    if (pattern.frequency === "weekly") {
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
            const invalidDays = pattern.daysOfWeek.filter(day => day < 0 || day > 6);
            if (invalidDays.length > 0) {
                errors.push("Days of week must be between 0 (Sunday) and 6 (Saturday)");
            }
        }
    }

    if (pattern.frequency === "monthly") {
        if (pattern.dayOfMonth && (pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31)) {
            errors.push("Day of month must be between 1 and 31");
        }
    }

    // Validate end conditions
    if (pattern.endDate && pattern.maxOccurrences) {
        errors.push("Cannot specify both endDate and maxOccurrences");
    }

    if (pattern.endDate) {
        const endDate = new Date(pattern.endDate);
        if (isNaN(endDate.getTime())) {
            errors.push("Invalid endDate format");
        }
    }

    if (pattern.maxOccurrences && pattern.maxOccurrences < 1) {
        errors.push("maxOccurrences must be at least 1");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Get human-readable description of recurring pattern
 */
export function getRecurringDescription(pattern: RecurringPattern): string {
    const parts: string[] = [];

    // Frequency
    if (pattern.interval === 1) {
        parts.push(pattern.frequency);
    } else {
        parts.push(`every ${pattern.interval} ${pattern.frequency === "daily" ? "days" : pattern.frequency === "weekly" ? "weeks" : "months"}`);
    }

    // Days of week (for weekly)
    if (pattern.frequency === "weekly" && pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const days = pattern.daysOfWeek.map(d => dayNames[d]).join(", ");
        parts.push(`on ${days}`);
    }

    // Day of month (for monthly)
    if (pattern.frequency === "monthly" && pattern.dayOfMonth) {
        parts.push(`on day ${pattern.dayOfMonth}`);
    }

    // End condition
    if (pattern.endDate) {
        const endDate = new Date(pattern.endDate);
        parts.push(`until ${endDate.toLocaleDateString()}`);
    } else if (pattern.maxOccurrences) {
        parts.push(`for ${pattern.maxOccurrences} occurrences`);
    }

    return parts.join(" ");
}

export const RecurringPostsHandler = {
    calculateNextOccurrence,
    generateOccurrences,
    createRecurringInstances,
    processRecurringPosts,
    validateRecurringPattern,
    getRecurringDescription,
};

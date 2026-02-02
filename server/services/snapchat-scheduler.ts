/**
 * Snapchat Scheduler Service
 * 
 * Core business logic for scheduling and managing Snapchat content.
 * Handles CRUD operations, validation, and scheduling logic.
 */

import {
    getScheduledPostsByUser,
    getDuePosts,
    getPostById,
    createScheduledPost,
    updateScheduledPost,
    deleteScheduledPost,
    updatePostStatus,
    getPostingStats,
} from "../db/queries/snapchat-scheduler";
import {
    type InsertSnapchatScheduledContent,
    type UpdateSnapchatScheduledContent,
    ScheduledContentStatus,
} from "@shared/schema";

/**
 * Schedule a new post
 * @param userId - User ID
 * @param accountId - Snapchat account ID  
 * @param content - Post content and scheduling details
 * @returns Created scheduled post
 */
export async function schedulePost(
    userId: number,
    accountId: string,
    content: {
        contentType: string;
        mediaUrl: string;
        thumbnailUrl?: string;
        caption?: string;
        duration?: number;
        scheduledFor: Date;
        timezone?: string;
        isRecurring?: boolean;
        recurringPattern?: any;
        metadata?: any;
    }
) {
    // Validate scheduled time is in the future
    const now = new Date();
    if (content.scheduledFor <= now) {
        throw new Error("Scheduled time must be in the future");
    }

    // Validate content type
    const validContentTypes = ["image", "video", "story"];
    if (!validContentTypes.includes(content.contentType)) {
        throw new Error(`Invalid content type. Must be one of: ${validContentTypes.join(", ")}`);
    }

    // Validate caption length
    if (content.caption && content.caption.length > 250) {
        throw new Error("Caption must be 250 characters or less");
    }

    // Validate video duration
    if (content.contentType === "video" && content.duration) {
        if (content.duration < 3 || content.duration > 60) {
            throw new Error("Video duration must be between 3 and 60 seconds");
        }
    }

    // Create scheduled post
    const post = await createScheduledPost({
        userId,
        snapchatAccountId: accountId,
        contentType: content.contentType,
        mediaUrl: content.mediaUrl,
        thumbnailUrl: content.thumbnailUrl,
        caption: content.caption,
        duration: content.duration,
        scheduledFor: content.scheduledFor,
        timezone: content.timezone || "UTC",
        isRecurring: content.isRecurring || false,
        recurringPattern: content.recurringPattern,
        metadata: content.metadata,
    });

    return post;
}

/**
 * Get scheduled posts for a user with optional filters
 * @param userId - User ID
 * @param filters - Optional filters (status, date range)
 * @returns Array of scheduled posts
 */
export async function getScheduledPosts(
    userId: number,
    filters?: {
        status?: string;
        startDate?: Date;
        endDate?: Date;
    }
) {
    return await getScheduledPostsByUser(userId, filters);
}

/**
 * Get a single scheduled post by ID
 * @param postId - Post ID
 * @param userId - User ID (for authorization)
 * @returns Scheduled post
 */
export async function getScheduledPost(postId: number, userId: number) {
    const post = await getPostById(postId);

    if (!post) {
        throw new Error("Post not found");
    }

    // Verify user owns this post
    if (post.userId !== userId) {
        throw new Error("Unauthorized: You do not own this post");
    }

    return post;
}

/**
 * Update a scheduled post
 * @param postId - Post ID
 * @param userId - User ID (for authorization)
 * @param updates - Fields to update
 * @returns Updated post
 */
export async function updateScheduledPostService(
    postId: number,
    userId: number,
    updates: UpdateSnapchatScheduledContent
) {
    // Verify post exists and user owns it
    const post = await getScheduledPost(postId, userId);

    // Don't allow editing published or publishing posts
    if (post.status === ScheduledContentStatus.PUBLISHED ||
        post.status === ScheduledContentStatus.PUBLISHING) {
        throw new Error("Cannot edit posts that are published or currently publishing");
    }

    // Validate scheduled time if being updated
    if (updates.scheduledFor) {
        const now = new Date();
        if (updates.scheduledFor <= now) {
            throw new Error("Scheduled time must be in the future");
        }
    }

    // Validate caption length if being updated
    if (updates.caption && updates.caption.length > 250) {
        throw new Error("Caption must be 250 characters or less");
    }

    return await updateScheduledPost(postId, updates);
}

/**
 * Cancel a scheduled post
 * @param postId - Post ID
 * @param userId - User ID (for authorization)
 * @returns Cancelled post
 */
export async function cancelScheduledPost(postId: number, userId: number) {
    // Verify post exists and user owns it
    const post = await getScheduledPost(postId, userId);

    // Don't allow cancelling published posts
    if (post.status === ScheduledContentStatus.PUBLISHED) {
        throw new Error("Cannot cancel posts that are already published");
    }

    // Don't allow cancelling posts that are currently publishing
    if (post.status === ScheduledContentStatus.PUBLISHING) {
        throw new Error("Cannot cancel posts that are currently publishing");
    }

    return await updatePostStatus(postId, ScheduledContentStatus.CANCELLED);
}

/**
 * Delete a scheduled post permanently
 * @param postId - Post ID
 * @param userId - User ID (for authorization)
 * @returns Deleted post
 */
export async function deleteScheduledPostService(postId: number, userId: number) {
    // Verify post exists and user owns it
    const post = await getScheduledPost(postId, userId);

    // Only allow deleting cancelled, failed, or draft posts
    const deletableStatuses = [
        ScheduledContentStatus.CANCELLED,
        ScheduledContentStatus.FAILED,
        ScheduledContentStatus.DRAFT,
    ];

    if (!deletableStatuses.includes(post.status)) {
        throw new Error("Can only delete cancelled, failed, or draft posts");
    }

    return await deleteScheduledPost(postId);
}

/**
 * Validate scheduled time is appropriate
 * @param time - Scheduled time
 * @param timezone - User's timezone
 * @returns Validation result
 */
export function validateScheduleTime(time: Date, timezone: string = "UTC"): {
    valid: boolean;
    error?: string;
    warnings?: string[];
} {
    const now = new Date();
    const warnings: string[] = [];

    // Must be in the future
    if (time <= now) {
        return {
            valid: false,
            error: "Scheduled time must be in the future",
        };
    }

    // Warn if scheduling very far in the future (> 30 days)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (time > thirtyDaysFromNow) {
        warnings.push("Scheduling more than 30 days in advance. Note that token expiration may affect publishing.");
    }

    // Warn if scheduling within the next 5 minutes
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    if (time < fiveMinutesFromNow) {
        warnings.push("Scheduling within the next 5 minutes. The post may not publish immediately.");
    }

    // Warn if scheduling during typical low-engagement hours (2 AM - 5 AM)
    const hour = time.getHours();
    if (hour >= 2 && hour < 5) {
        warnings.push("Scheduling during typical low-engagement hours (2 AM - 5 AM). Consider scheduling at a different time for better reach.");
    }

    return {
        valid: true,
        warnings: warnings.length > 0 ? warnings : undefined,
    };
}

/**
 * Get posts that are due for publishing
 * @param limit - Maximum number of posts to retrieve
 * @returns Posts ready to publish
 */
export async function getPostsDueForPublishing(limit: number = 50) {
    return await getDuePosts(limit);
}

/**
 * Get user's posting statistics
 * @param userId - User ID
 * @returns Statistics object
 */
export async function getUserPostingStats(userId: number) {
    return await getPostingStats(userId);
}

/**
 * Duplicate a scheduled post (create a copy)
 * @param postId - Post ID to duplicate
 * @param userId - User ID (for authorization)
 * @param newScheduledTime - New scheduled time for the duplicate
 * @returns Duplicated post
 */
export async function duplicateScheduledPost(
    postId: number,
    userId: number,
    newScheduledTime: Date
) {
    // Get original post
    const original = await getScheduledPost(postId, userId);

    // Validate new scheduled time
    const validation = validateScheduleTime(newScheduledTime, original.timezone);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Create duplicate
    return await schedulePost(userId, original.snapchatAccountId, {
        contentType: original.contentType,
        mediaUrl: original.mediaUrl,
        thumbnailUrl: original.thumbnailUrl,
        caption: original.caption ? `${original.caption} (Copy)` : undefined,
        duration: original.duration,
        scheduledFor: newScheduledTime,
        timezone: original.timezone,
        isRecurring: false, // Don't copy recurring pattern
        metadata: original.metadata,
    });
}

/**
 * Reschedule a post to a new time
 * @param postId - Post ID
 * @param userId - User ID (for authorization)
 * @param newScheduledTime - New scheduled time
 * @returns Updated post
 */
export async function reschedulePost(
    postId: number,
    userId: number,
    newScheduledTime: Date
) {
    // Verify post exists and user owns it
    const post = await getScheduledPost(postId, userId);

    // Validate new scheduled time
    const validation = validateScheduleTime(newScheduledTime, post.timezone);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Reset status to scheduled if it was failed or cancelled
    const updates: UpdateSnapchatScheduledContent = {
        scheduledFor: newScheduledTime,
    };

    if (post.status === ScheduledContentStatus.FAILED ||
        post.status === ScheduledContentStatus.CANCELLED) {
        updates.status = ScheduledContentStatus.SCHEDULED;
        updates.failureReason = null;
        updates.retryCount = 0;
    }

    return await updateScheduledPost(postId, updates);
}

export const SnapchatSchedulerService = {
    schedulePost,
    getScheduledPosts,
    getScheduledPost,
    updateScheduledPost: updateScheduledPostService,
    cancelScheduledPost,
    deleteScheduledPost: deleteScheduledPostService,
    validateScheduleTime,
    getPostsDueForPublishing,
    getUserPostingStats,
    duplicateScheduledPost,
    reschedulePost,
};

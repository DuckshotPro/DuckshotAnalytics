/**
 * Snapchat Publisher Service
 * 
 * Handles the actual publishing of scheduled content to Snapchat.
 * Integrates with Snapchat Content Upload API and manages retry logic.
 */

import {
    getPostById,
    updatePostStatus,
    incrementRetryCount,
    createPublishLog,
} from "../db/queries/snapchat-scheduler";
import {
    ScheduledContentStatus,
    PublishLogStatus,
} from "@shared/schema";
import { logger } from "../logger";

/**
 * Media validation specs from Snapchat
 */
const SNAPCHAT_MEDIA_SPECS = {
    image: {
        formats: ["jpg", "jpeg", "png"],
        maxSize: 5 * 1024 * 1024, // 5MB
        minDimensions: { width: 1080, height: 1920 },
        aspectRatio: 9 / 16,
    },
    video: {
        formats: ["mp4", "mov"],
        maxSize: 100 * 1024 * 1024, // 100MB
        maxDuration: 60, // seconds
        minDuration: 3, // seconds
        minDimensions: { width: 1080, height: 1920 },
        aspectRatio: 9 / 16,
    },
};

/**
 * Validate media file against Snapchat specifications
 * @param file - Media file metadata
 * @returns Validation result
 */
export function validateMedia(file: {
    type: string;
    size: number;
    duration?: number;
    width?: number;
    height?: number;
}): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const mediaType = file.type.startsWith("video") ? "video" : "image";
    const specs = SNAPCHAT_MEDIA_SPECS[mediaType];

    // Check file size
    if (file.size > specs.maxSize) {
        errors.push(`File size exceeds maximum of ${specs.maxSize / (1024 * 1024)}MB`);
    }

    // Check video duration
    if (mediaType === "video" && file.duration) {
        if (file.duration < specs.minDuration) {
            errors.push(`Video duration must be at least ${specs.minDuration} seconds`);
        }
        if (file.duration > specs.maxDuration) {
            errors.push(`Video duration must not exceed ${specs.maxDuration} seconds`);
        }
    }

    // Check dimensions
    if (file.width && file.height) {
        if (file.width < specs.minDimensions.width || file.height < specs.minDimensions.height) {
            errors.push(`Minimum dimensions: ${specs.minDimensions.width}x${specs.minDimensions.height}`);
        }

        // Check aspect ratio (with some tolerance)
        const fileAspectRatio = file.height / file.width;
        const expectedRatio = 1 / specs.aspectRatio;
        const tolerance = 0.05;

        if (Math.abs(fileAspectRatio - expectedRatio) > tolerance) {
            errors.push(`Recommended aspect ratio: ${specs.aspectRatio}:1 (9:16)`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Upload media to Snapchat API
 * @param accountId - Snapchat account ID
 * @param accessToken - Snapchat OAuth access token
 * @param media - Media details
 * @param caption - Post caption
 * @returns Snapchat post ID
 */
async function uploadToSnapchat(
    accountId: string,
    accessToken: string,
    media: {
        url: string;
        type: string;
        duration?: number;
    },
    caption?: string
): Promise<{ postId: string; publishedAt: string }> {
    // Step 1: Create media upload session
    const mediaType = media.type.startsWith("video") ? "VIDEO" : "IMAGE";

    const createMediaResponse = await fetch("https://adsapi.snapchat.com/v1/me/media", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            media_type: mediaType,
            name: caption || `Scheduled post ${new Date().toISOString()}`,
        }),
    });

    if (!createMediaResponse.ok) {
        const error = await createMediaResponse.json();
        throw new Error(`Snapchat API Error (Media Init): ${error.error_description || error.error || "Unknown error"}`);
    }

    const mediaData = await createMediaResponse.json();
    const uploadUrl = mediaData.media.upload_url;
    const mediaId = mediaData.media.id;

    // Step 2: Upload media file to the upload URL
    const mediaFileResponse = await fetch(media.url);
    const mediaBlob = await mediaFileResponse.blob();

    const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
            "Content-Type": media.type,
        },
        body: mediaBlob,
    });

    if (!uploadResponse.ok) {
        throw new Error(`Snapchat API Error (Media Upload): Failed to upload media file`);
    }

    // Step 3: Create story/post with the uploaded media
    const createStoryResponse = await fetch("https://adsapi.snapchat.com/v1/me/stories", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            media_id: mediaId,
            caption: caption,
        }),
    });

    if (!createStoryResponse.ok) {
        const error = await createStoryResponse.json();
        throw new Error(`Snapchat API Error (Story Create): ${error.error_description || error.error || "Unknown error"}`);
    }

    const storyData = await createStoryResponse.json();

    return {
        postId: storyData.story.id,
        publishedAt: storyData.story.created_at || new Date().toISOString(),
    };
}

/**
 * Publish a scheduled post to Snapchat
 * @param scheduledContentId - ID of the scheduled post
 * @returns Publish result
 */
export async function publishPost(scheduledContentId: number): Promise<{
    success: boolean;
    snapchatPostId?: string;
    error?: string;
}> {
    try {
        // Get the scheduled post
        const post = await getPostById(scheduledContentId);

        if (!post) {
            throw new Error(`Post ${scheduledContentId} not found`);
        }

        // Check if post is in correct status
        if (post.status !== ScheduledContentStatus.SCHEDULED) {
            logger.warn(`Post ${scheduledContentId} is not in SCHEDULED status (current: ${post.status}), skipping`);
            return { success: false, error: "Post is not scheduled" };
        }

        // Update status to PUBLISHING
        await updatePostStatus(scheduledContentId, ScheduledContentStatus.PUBLISHING);

        logger.info(`Publishing post ${scheduledContentId} for user ${post.userId}`);

        // Get user's Snapchat access token
        // TODO: Implement token retrieval from oauth_tokens table
        const accessToken = "PLACEHOLDER_ACCESS_TOKEN"; // Replace with actual token retrieval

        // Upload to Snapchat
        const result = await uploadToSnapchat(
            post.snapchatAccountId,
            accessToken,
            {
                url: post.mediaUrl,
                type: post.contentType,
                duration: post.duration || undefined,
            },
            post.caption || undefined
        );

        // Update post status to PUBLISHED
        await updatePostStatus(scheduledContentId, ScheduledContentStatus.PUBLISHED, {
            publishedAt: new Date(result.publishedAt),
        });

        // Log successful publish
        await createPublishLog({
            scheduledContentId,
            status: PublishLogStatus.SUCCESS,
            snapchatPostId: result.postId,
            responseData: result,
        });

        logger.info(`Successfully published post ${scheduledContentId}, Snapchat post ID: ${result.postId}`);

        return {
            success: true,
            snapchatPostId: result.postId,
        };
    } catch (error: any) {
        logger.error(`Failed to publish post ${scheduledContentId}:`, error);

        // Log failed publish attempt
        await createPublishLog({
            scheduledContentId,
            status: PublishLogStatus.FAILED,
            errorMessage: error.message,
            errorCode: error.code || "UNKNOWN_ERROR",
            responseData: { error: error.message },
        });

        // Increment retry count
        await incrementRetryCount(scheduledContentId);

        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Retry publishing a failed post
 * @param scheduledContentId - ID of the scheduled post
 * @returns Publish result
 */
export async function retryFailedPost(scheduledContentId: number): Promise<{
    success: boolean;
    snapchatPostId?: string;
    error?: string;
}> {
    const post = await getPostById(scheduledContentId);

    if (!post) {
        throw new Error(`Post ${scheduledContentId} not found`);
    }

    // Check if post has exceeded max retries
    if (post.retryCount >= post.maxRetries) {
        logger.warn(`Post ${scheduledContentId} has exceeded max retries (${post.maxRetries})`);
        return { success: false, error: "Max retries exceeded" };
    }

    // Reset status to SCHEDULED to allow publishing
    await updatePostStatus(scheduledContentId, ScheduledContentStatus.SCHEDULED);

    // Log retry attempt
    await createPublishLog({
        scheduledContentId,
        status: PublishLogStatus.RETRYING,
        errorMessage: `Retrying failed post (attempt ${post.retryCount + 1}/${post.maxRetries})`,
        responseData: {
            retryAttempt: post.retryCount + 1,
            maxRetries: post.maxRetries,
        },
    });

    logger.info(`Retrying post ${scheduledContentId} (attempt ${post.retryCount + 1}/${post.maxRetries})`);

    // Attempt to publish
    return await publishPost(scheduledContentId);
}

/**
 * Batch publish multiple posts
 * @param scheduledContentIds - Array of post IDs
 * @param concurrency - Number of concurrent publishes (default: 3)
 * @returns Array of publish results
 */
export async function batchPublishPosts(
    scheduledContentIds: number[],
    concurrency: number = 3
): Promise<Array<{ postId: number; success: boolean; snapchatPostId?: string; error?: string }>> {
    const results: Array<{ postId: number; success: boolean; snapchatPostId?: string; error?: string }> = [];

    // Process in batches of 'concurrency' at a time
    for (let i = 0; i < scheduledContentIds.length; i += concurrency) {
        const batch = scheduledContentIds.slice(i, i + concurrency);

        const batchResults = await Promise.all(
            batch.map(async (postId) => {
                const result = await publishPost(postId);
                return {
                    postId,
                    ...result,
                };
            })
        );

        results.push(...batchResults);

        // Small delay between batches to avoid rate limiting
        if (i + concurrency < scheduledContentIds.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return results;
}

export const SnapchatPublisherService = {
    validateMedia,
    publishPost,
    retryFailedPost,
    batchPublishPosts,
};

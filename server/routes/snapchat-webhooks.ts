/**
 * Snapchat Webhook Handler
 * 
 * Handles webhooks from Snapchat API for post status updates,
 * analytics callbacks, and error notifications.
 */

import { Router } from "express";
import crypto from "crypto";
import {
    updatePostStatus,
    getPostById,
    updatePostAnalytics,
    createSchedulerAnalyticsRecord,
    calculateAndUpdateAnalytics
} from "../db/queries/snapchat-scheduler";
import { ScheduledContentStatus } from "@shared/schema";
import { logger } from "../logger";

const router = Router();

/**
 * Verify Snapchat webhook signature
 */
function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

/**
 * POST /api/snapchat/webhooks
 * Receive and process Snapchat webhooks
 */
router.post("/webhooks", async (req, res) => {
    try {
        // Get webhook secret from environment
        const webhookSecret = process.env.SNAPCHAT_WEBHOOK_SECRET || "";

        if (!webhookSecret) {
            logger.warn("Snapchat webhook received but SNAPCHAT_WEBHOOK_SECRET not configured");
            return res.status(500).json({ error: "Webhook secret not configured" });
        }

        // Verify signature
        const signature = req.headers["x-snapchat-signature"] as string;
        const payload = JSON.stringify(req.body);

        if (!signature || !verifyWebhookSignature(payload, signature, webhookSecret)) {
            logger.warn("Snapchat webhook received with invalid signature");
            return res.status(401).json({ error: "Invalid signature" });
        }

        // Process webhook event
        const event = req.body;

        logger.info(`Snapchat Webhook: Received event type: ${event.event_type}`);

        switch (event.event_type) {
            case "story.published":
                await handleStoryPublished(event);
                break;

            case "story.failed":
                await handleStoryFailed(event);
                break;

            case "story.deleted":
                await handleStoryDeleted(event);
                break;

            case "story.analytics":
                await handleStoryAnalytics(event);
                break;

            default:
                logger.warn(`Snapchat Webhook: Unknown event type: ${event.event_type}`);
        }

        // Always respond 200 to acknowledge receipt
        res.status(200).json({ success: true });
    } catch (error: any) {
        logger.error("Snapchat Webhook: Error processing webhook:", error);

        // Still respond 200 to prevent retries for our internal errors
        res.status(200).json({ success: false, error: error.message });
    }
});

/**
 * Handle story.published event
 */
async function handleStoryPublished(event: any) {
    try {
        const { story_id, published_at, metadata } = event.data;

        logger.info(`Snapchat Webhook: Story published - ${story_id}`);

        // Find the scheduled post by metadata (we should include our post ID in metadata)
        if (metadata?.scheduled_post_id) {
            const postId = parseInt(metadata.scheduled_post_id);

            await updatePostStatus(postId, ScheduledContentStatus.PUBLISHED, {
                publishedAt: new Date(published_at),
            });

            logger.info(`Snapchat Webhook: Updated post ${postId} to PUBLISHED`);
        }
    } catch (error: any) {
        logger.error("Snapchat Webhook: Error handling story.published:", error);
    }
}

/**
 * Handle story.failed event
 */
async function handleStoryFailed(event: any) {
    try {
        const { story_id, error_code, error_message, metadata } = event.data;

        logger.warn(`Snapchat Webhook: Story failed - ${story_id}: ${error_message}`);

        // Find the scheduled post
        if (metadata?.scheduled_post_id) {
            const postId = parseInt(metadata.scheduled_post_id);

            await updatePostStatus(postId, ScheduledContentStatus.FAILED, {
                failureReason: `${error_code}: ${error_message}`,
            });

            logger.info(`Snapchat Webhook: Updated post ${postId} to FAILED`);
        }
    } catch (error: any) {
        logger.error("Snapchat Webhook: Error handling story.failed:", error);
    }
}

/**
 * Handle story.deleted event
 */
async function handleStoryDeleted(event: any) {
    try {
        const { story_id, deleted_at, metadata } = event.data;

        logger.info(`Snapchat Webhook: Story deleted - ${story_id}`);

        // Update post status or mark as deleted
        if (metadata?.scheduled_post_id) {
            const postId = parseInt(metadata.scheduled_post_id);

            // You might want to add a "deleted" status or just log this event
            logger.info(`Snapchat Webhook: Story for post ${postId} was deleted at ${deleted_at}`);
        }
    } catch (error: any) {
        logger.error("Snapchat Webhook: Error handling story.deleted:", error);
    }
}

/**
 * Handle story.analytics event
 */
async function handleStoryAnalytics(event: any) {
    try {
        const { story_id, analytics, metadata } = event.data;

        logger.info(`Snapchat Webhook: Analytics received for story ${story_id}`);

        // Store analytics data
        if (metadata?.scheduled_post_id) {
            const postId = parseInt(metadata.scheduled_post_id);

            // 1. Store analytics in post metadata (snapchat_scheduled_content table)
            const post = await updatePostAnalytics(postId, analytics);

            if (post) {
                logger.info(`Snapchat Webhook: Analytics stored in post metadata for ${postId}`);

                // 2. Insert raw analytics record into snapchat_scheduler_analytics table
                await createSchedulerAnalyticsRecord({
                    userId: post.userId,
                    scheduledContentId: postId,
                    metrics: analytics
                });
                logger.info(`Snapchat Webhook: Raw analytics record inserted into snapchat_scheduler_analytics for post ${postId}`);

                // 3. Update the aggregated analytics record for the current month
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

                await calculateAndUpdateAnalytics(post.userId, startOfMonth, endOfMonth);
                logger.info(`Snapchat Webhook: Updated aggregated analytics for user ${post.userId}`);
            } else {
                logger.warn(`Snapchat Webhook: Post ${postId} not found for analytics`);
            }
        }
    } catch (error: any) {
        logger.error("Snapchat Webhook: Error handling story.analytics:", error);
    }
}

/**
 * GET /api/snapchat/webhooks/verify
 * Verify webhook endpoint (for Snapchat setup)
 */
router.get("/webhooks/verify", (req, res) => {
    const challenge = req.query.challenge as string;

    if (!challenge) {
        return res.status(400).json({ error: "Missing challenge parameter" });
    }

    logger.info("Snapchat Webhook: Verification request received");

    // Return the challenge to verify ownership
    res.status(200).send(challenge);
});

export default router;

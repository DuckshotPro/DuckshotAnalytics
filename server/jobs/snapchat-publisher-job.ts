/**
 * Snapchat Publisher Cron Job
 * 
 * Automated job that runs every minute to publish scheduled posts.
 * Finds posts that are due for publishing and processes them.
 */

import cron from "node-cron";
import { SnapchatSchedulerService } from "../services/snapchat-scheduler";
import { SnapchatPublisherService } from "../services/snapchat-publisher";
import { logger } from "../logger";

/**
 * Process due posts and publish them to Snapchat
 */
async function processDuePosts() {
    try {
        logger.info("Snapchat Publisher Job: Starting...");

        // Get posts that are due for publishing
        const duePosts = await SnapchatSchedulerService.getPostsDueForPublishing(50);

        if (duePosts.length === 0) {
            logger.info("Snapchat Publisher Job: No posts due for publishing");
            return;
        }

        logger.info(`Snapchat Publisher Job: Found ${duePosts.length} posts due for publishing`);

        // Publish posts with concurrency control (max 3 at a time)
        const results = await SnapchatPublisherService.batchPublishPosts(
            duePosts.map(post => post.id),
            3 // Publish max 3 posts concurrently
        );

        // Log results
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        logger.info(
            `Snapchat Publisher Job: Complete. ` +
            `${successCount} succeeded, ${failureCount} failed`
        );

        // Log individual failures for debugging
        results
            .filter(r => !r.success)
            .forEach(result => {
                logger.warn(
                    `Snapchat Publisher Job: Failed to publish post ${result.postId}: ${result.error}`
                );
            });

    } catch (error: any) {
        logger.error("Snapchat Publisher Job: Error processing due posts:", error);
    }
}

/**
 * Start the Snapchat publisher cron job
 * Runs every minute: "* * * * *"
 */
export function startSnapchatPublisherJob() {
    logger.info("Starting Snapchat Publisher Cron Job (runs every minute)");

    // Schedule: Every minute
    const job = cron.schedule("* * * * *", async () => {
        await processDuePosts();
    }, {
        timezone: "UTC", // Always use UTC for consistency
    });

    // Also run immediately on startup to catch any missed posts
    logger.info("Snapchat Publisher Job: Running initial check...");
    processDuePosts();

    return job;
}

/**
 * Stop the Snapchat publisher cron job
 */
export function stopSnapchatPublisherJob(job: { stop: () => void }) {
    logger.info("Stopping Snapchat Publisher Cron Job");
    job.stop();
}

// Export the process function for manual testing
export { processDuePosts };

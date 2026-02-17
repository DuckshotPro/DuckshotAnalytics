/**
 * Storage Cleanup Job
 * 
 * Automated cleanup of old and orphaned media files.
 * Runs periodically to free up storage space.
 */

import cron from "node-cron";
import { db } from "../db";
import { snapchatScheduledContent, ScheduledContentStatus } from "@shared/schema";
import { eq, or } from "drizzle-orm";
import { logger } from "../logger";
import { LocalStorageHandler } from "../storage/local-storage";

/**
 * Find orphaned media files (files without associated posts)
 */
export const findOrphanedFiles = async (): Promise<string[]> => {
    try {
        logger.info("Searching for orphaned media files...");

        // Get storage config and base path
        const { getStorageConfig } = await import("../config/storage");
        const config = getStorageConfig();

        // Return empty if not using local storage for now (S3 requires different approach)
        if (config.provider !== "local") {
            logger.info("Orphaned file detection only supported for local storage currently");
            return [];
        }

        const fs = await import("fs/promises");
        const path = await import("path");
        const scheduledDir = path.join(config.basePath, "snapchat", "scheduled");

        // Helper to recursively list all files
        const listFiles = async (dir: string): Promise<string[]> => {
            const files: string[] = [];
            try {
                const items = await fs.readdir(dir, { withFileTypes: true });
                for (const item of items) {
                    const fullPath = path.join(dir, item.name);
                    if (item.isDirectory()) {
                        files.push(...(await listFiles(fullPath)));
                    } else {
                        // Normalize to relative path used in database
                        const relativePath = path.relative(config.basePath, fullPath).replace(/\\/g, "/");
                        files.push(relativePath);
                    }
                }
            } catch (err) {
                // Directory might not exist
            }
            return files;
        };

        const allFiles = await listFiles(scheduledDir);
        if (allFiles.length === 0) return [];

        // Get all referenced files from database
        const rows = await db
            .select({
                mediaUrl: snapchatScheduledContent.mediaUrl,
                thumbnailUrl: snapchatScheduledContent.thumbnailUrl
            })
            .from(snapchatScheduledContent);

        const referencedPaths = new Set<string>();
        rows.forEach(row => {
            if (row.mediaUrl) referencedPaths.add(row.mediaUrl);
            if (row.thumbnailUrl) referencedPaths.add(row.thumbnailUrl);
        });

        // Orphaned files are those in storage but not referenced in DB
        const orphaned = allFiles.filter(file => !referencedPaths.has(file));

        logger.info(`Found ${orphaned.length} orphaned files out of ${allFiles.length} total files`);
        return orphaned;
    } catch (error: any) {
        logger.error(`Error finding orphaned files: ${error.message}`);
        return [];
    }
};

/**
 * Delete orphaned media files
 */
export const deleteOrphanedFiles = async (files: string[]): Promise<number> => {
    if (files.length === 0) return 0;

    const { getStorageConfig } = await import("../config/storage");
    const config = getStorageConfig();
    const fs = await import("fs/promises");
    const path = await import("path");

    let deletedCount = 0;
    for (const file of files) {
        try {
            const fullPath = path.join(config.basePath, file);
            await fs.unlink(fullPath);
            deletedCount++;
        } catch (err) {
            logger.warn(`Failed to delete orphaned file ${file}`);
        }
    }

    return deletedCount;
};

/**
 * Clean up files for cancelled or failed posts
 */
export const cleanupCancelledAndFailedPosts = async (): Promise<{
    deletedPosts: number;
    deletedFiles: number;
    freedBytes: number;
}> => {
    try {
        logger.info("Cleaning up cancelled and failed posts...");

        // Get posts that are cancelled or failed and older than 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const oldPosts = await db
            .select()
            .from(snapchatScheduledContent)
            .where(
                or(
                    eq(snapchatScheduledContent.status, ScheduledContentStatus.CANCELLED),
                    eq(snapchatScheduledContent.status, ScheduledContentStatus.FAILED)
                )
            );

        let deletedFiles = 0;
        let freedBytes = 0;

        for (const post of oldPosts) {
            if (post.updatedAt < sevenDaysAgo) {
                try {
                    // Delete associated files
                    if (typeof post.id === 'string' || typeof post.id === 'number') {
                        const result = await LocalStorageHandler.deletePostFiles(
                            post.userId,
                            post.id
                        );

                        deletedFiles += result.deletedFiles;
                        freedBytes += result.freedBytes;

                        logger.debug(`Cleaned up files for post ${post.id}`);
                    }
                } catch (error: any) {
                    logger.warn(`Failed to cleanup files for post ${post.id}: ${error.message}`);
                }
            }
        }

        logger.info(
            `Cleanup complete: ${oldPosts.length} posts, ${deletedFiles} files, ${freedBytes} bytes freed`
        );

        return {
            deletedPosts: oldPosts.length,
            deletedFiles,
            freedBytes,
        };
    } catch (error: any) {
        logger.error(`Error cleaning up cancelled/failed posts: ${error.message}`);
        throw error;
    }
};

/**
 * Clean up old published posts (keep files for 30 days after publishing)
 */
export const cleanupOldPublishedPosts = async (): Promise<{
    deletedFiles: number;
    freedBytes: number;
}> => {
    try {
        logger.info("Cleaning up old published posts...");

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const oldPublished = await db
            .select()
            .from(snapchatScheduledContent)
            .where(eq(snapchatScheduledContent.status, ScheduledContentStatus.PUBLISHED));

        let deletedFiles = 0;
        let freedBytes = 0;

        for (const post of oldPublished) {
            if (post.publishedAt && post.publishedAt < thirtyDaysAgo) {
                try {
                    const result = await LocalStorageHandler.deletePostFiles(
                        post.userId,
                        post.id
                    );

                    deletedFiles += result.deletedFiles;
                    freedBytes += result.freedBytes;

                    logger.debug(`Cleaned up files for published post ${post.id}`);
                } catch (error: any) {
                    logger.warn(`Failed to cleanup files for post ${post.id}: ${error.message}`);
                }
            }
        }

        logger.info(`Old published cleanup: ${deletedFiles} files, ${freedBytes} bytes freed`);

        return { deletedFiles, freedBytes };
    } catch (error: any) {
        logger.error(`Error cleaning up old published posts: ${error.message}`);
        throw error;
    }
};

/**
 * Run full storage cleanup
 */
export const runStorageCleanup = async (): Promise<{
    cancelledAndFailed: { deletedPosts: number; deletedFiles: number; freedBytes: number };
    oldPublished: { deletedFiles: number; freedBytes: number };
    totalFreed: number;
}> => {
    try {
        logger.info("Storage Cleanup Job: Starting full cleanup...");

        // Clean up cancelled and failed posts
        const cancelledAndFailed = await cleanupCancelledAndFailedPosts();

        // Clean up old published posts
        const oldPublished = await cleanupOldPublishedPosts();

        // Find and delete orphaned files
        const orphaned = await findOrphanedFiles();
        await deleteOrphanedFiles(orphaned);

        const totalFreed = cancelledAndFailed.freedBytes + oldPublished.freedBytes;

        logger.info(
            `Storage Cleanup Job: Complete. Total freed: ${(totalFreed / (1024 * 1024)).toFixed(2)}MB`
        );

        return {
            cancelledAndFailed,
            oldPublished,
            totalFreed,
        };
    } catch (error: any) {
        logger.error(`Storage Cleanup Job: Error: ${error.message}`);
        throw error;
    }
};

/**
 * Start the storage cleanup cron job
 * Runs daily at 3 AM
 */
export const startStorageCleanupJob = () => {
    logger.info("Starting Storage Cleanup Cron Job (runs daily at 3 AM)");

    // Schedule: Every day at 3 AM
    const job = cron.schedule("0 3 * * *", async () => {
        try {
            await runStorageCleanup();
        } catch (error: any) {
            logger.error(`Storage Cleanup Job: Failed: ${error.message}`);
        }
    }, {
        timezone: "UTC",
    });

    return job;
};

/**
 * Stop the storage cleanup cron job
 */
export const stopStorageCleanupJob = (job: { stop: () => void }) => {
    logger.info("Stopping Storage Cleanup Cron Job");
    job.stop();
};

export const StorageCleanup = {
    findOrphanedFiles,
    deleteOrphanedFiles,
    cleanupCancelledAndFailedPosts,
    cleanupOldPublishedPosts,
    runStorageCleanup,
    startStorageCleanupJob,
    stopStorageCleanupJob,
};

/**
 * Snapchat Scheduler API Routes
 * 
 * RESTful API endpoints for managing scheduled Snapchat content.
 * Provides CRUD operations with authentication and validation.
 */

import { Router } from "express";
import { z } from "zod";
import { SnapchatSchedulerService } from "../services/snapchat-scheduler";
import { logger } from "../logger";
import { upload } from "../middleware/upload";
import { MediaProcessor } from "../services/media-processor";
import { LocalStorageHandler } from "../storage/local-storage";
import path from "path";

const router = Router();

// ===================================
// Request Validation Schemas
// ===================================

const createScheduledPostSchema = z.object({
    snapchatAccountId: z.string().min(1, "Snapchat account ID is required"),
    contentType: z.enum(["image", "video", "story"]),
    mediaUrl: z.string().url("Invalid media URL"),
    thumbnailUrl: z.string().url("Invalid thumbnail URL").optional(),
    caption: z.string().max(250, "Caption must be 250 characters or less").optional(),
    duration: z.number().int().min(3).max(60).optional(),
    scheduledFor: z.string().datetime(), // ISO 8601 format
    timezone: z.string().default("UTC"),
    isRecurring: z.boolean().default(false),
    recurringPattern: z.object({
        frequency: z.enum(["daily", "weekly", "monthly", "custom"]),
        interval: z.number().int().min(1),
        daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
        endDate: z.string().datetime().optional(),
    }).optional(),
    metadata: z.any().optional(),
});

const updateScheduledPostSchema = z.object({
    caption: z.string().max(250).optional(),
    scheduledFor: z.string().datetime().optional(),
    timezone: z.string().optional(),
    status: z.enum(["draft", "scheduled", "cancelled"]).optional(),
    metadata: z.any().optional(),
});

const getScheduledPostsQuerySchema = z.object({
    status: z.enum(["draft", "scheduled", "publishing", "published", "failed", "cancelled"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

// ===================================
// Route Handlers
// ===================================

/**
 * POST /api/snapchat/schedule
 * Create a new scheduled post
 */
router.post("/schedule", async (req, res) => {
    try {
        // @ts-ignore - user is added by auth middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Validate request body
        const validation = createScheduledPostSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                error: "Validation error",
                details: validation.error.errors,
            });
        }

        const data = validation.data;

        // Schedule the post
        const post = await SnapchatSchedulerService.schedulePost(
            userId,
            data.snapchatAccountId,
            {
                contentType: data.contentType,
                mediaUrl: data.mediaUrl,
                thumbnailUrl: data.thumbnailUrl,
                caption: data.caption,
                duration: data.duration,
                scheduledFor: new Date(data.scheduledFor),
                timezone: data.timezone,
                isRecurring: data.isRecurring,
                recurringPattern: data.recurringPattern,
                metadata: data.metadata,
            }
        );

        logger.info(`User ${userId} created scheduled post ${post.id}`);

        res.status(201).json({
            success: true,
            post,
        });
    } catch (error: any) {
        logger.error("Error creating scheduled post:", error);
        res.status(400).json({
            error: error.message || "Failed to create scheduled post",
        });
    }
});

/**
 * GET /api/snapchat/scheduled
 * List all scheduled posts for the authenticated user
 */
router.get("/scheduled", async (req, res) => {
    try {
        // @ts-ignore - user is added by auth middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Validate query parameters
        const validation = getScheduledPostsQuerySchema.safeParse(req.query);

        if (!validation.success) {
            return res.status(400).json({
                error: "Invalid query parameters",
                details: validation.error.errors,
            });
        }

        const { status, startDate, endDate } = validation.data;

        // Get scheduled posts
        const posts = await SnapchatSchedulerService.getScheduledPosts(userId, {
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });

        res.json({
            success: true,
            count: posts.length,
            posts,
        });
    } catch (error: any) {
        logger.error("Error fetching scheduled posts:", error);
        res.status(500).json({
            error: "Failed to fetch scheduled posts",
        });
    }
});

/**
 * GET /api/snapchat/scheduled/:id
 * Get a single scheduled post by ID
 */
router.get("/scheduled/:id", async (req, res) => {
    try {
        // @ts-ignore - user is added by auth middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const postId = parseInt(req.params.id);

        if (isNaN(postId)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }

        // Get the post
        const post = await SnapchatSchedulerService.getScheduledPost(postId, userId);

        res.json({
            success: true,
            post,
        });
    } catch (error: any) {
        logger.error(`Error fetching scheduled post ${req.params.id}:`, error);

        if (error.message.includes("not found")) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (error.message.includes("Unauthorized")) {
            return res.status(403).json({ error: "Forbidden" });
        }

        res.status(500).json({
            error: "Failed to fetch scheduled post",
        });
    }
});

/**
 * PUT /api/snapchat/scheduled/:id
 * Update a scheduled post
 */
router.put("/scheduled/:id", async (req, res) => {
    try {
        // @ts-ignore - user is added by auth middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const postId = parseInt(req.params.id);

        if (isNaN(postId)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }

        // Validate request body
        const validation = updateScheduledPostSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                error: "Validation error",
                details: validation.error.errors,
            });
        }

        const data = validation.data;

        // Update the post
        const updatedPost = await SnapchatSchedulerService.updateScheduledPost(
            postId,
            userId,
            {
                caption: data.caption,
                scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
                timezone: data.timezone,
                status: data.status,
                metadata: data.metadata,
            }
        );

        logger.info(`User ${userId} updated scheduled post ${postId}`);

        res.json({
            success: true,
            post: updatedPost,
        });
    } catch (error: any) {
        logger.error(`Error updating scheduled post ${req.params.id}:`, error);

        if (error.message.includes("not found")) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (error.message.includes("Unauthorized")) {
            return res.status(403).json({ error: "Forbidden" });
        }

        res.status(400).json({
            error: error.message || "Failed to update scheduled post",
        });
    }
});

/**
 * DELETE /api/snapchat/scheduled/:id
 * Delete/cancel a scheduled post
 */
router.delete("/scheduled/:id", async (req, res) => {
    try {
        // @ts-ignore - user is added by auth middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const postId = parseInt(req.params.id);

        if (isNaN(postId)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }

        // Check if permanent delete is requested
        const permanent = req.query.permanent === "true";

        if (permanent) {
            // Permanent delete
            const deletedPost = await SnapchatSchedulerService.deleteScheduledPost(postId, userId);

            logger.info(`User ${userId} permanently deleted scheduled post ${postId}`);

            res.json({
                success: true,
                message: "Post permanently deleted",
                post: deletedPost,
            });
        } else {
            // Cancel (soft delete)
            const cancelledPost = await SnapchatSchedulerService.cancelScheduledPost(postId, userId);

            logger.info(`User ${userId} cancelled scheduled post ${postId}`);

            res.json({
                success: true,
                message: "Post cancelled",
                post: cancelledPost,
            });
        }
    } catch (error: any) {
        logger.error(`Error deleting/cancelling scheduled post ${req.params.id}:`, error);

        if (error.message.includes("not found")) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (error.message.includes("Unauthorized")) {
            return res.status(403).json({ error: "Forbidden" });
        }

        res.status(400).json({
            error: error.message || "Failed to delete/cancel scheduled post",
        });
    }
});

/**
 * POST /api/snapchat/scheduled/:id/reschedule
 * Reschedule a post to a new time
 */
router.post("/scheduled/:id/reschedule", async (req, res) => {
    try {
        // @ts-ignore - user is added by auth middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const postId = parseInt(req.params.id);

        if (isNaN(postId)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }

        const { scheduledFor } = req.body;

        if (!scheduledFor) {
            return res.status(400).json({ error: "scheduledFor is required" });
        }

        // Reschedule the post
        const updatedPost = await SnapchatSchedulerService.reschedulePost(
            postId,
            userId,
            new Date(scheduledFor)
        );

        logger.info(`User ${userId} rescheduled post ${postId} to ${scheduledFor}`);

        res.json({
            success: true,
            message: "Post rescheduled successfully",
            post: updatedPost,
        });
    } catch (error: any) {
        logger.error(`Error rescheduling scheduled post ${req.params.id}:`, error);

        if (error.message.includes("not found")) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (error.message.includes("Unauthorized")) {
            return res.status(403).json({ error: "Forbidden" });
        }

        res.status(400).json({
            error: error.message || "Failed to reschedule post",
        });
    }
});

/**
 * POST /api/snapchat/scheduled/:id/duplicate
 * Duplicate a scheduled post
 */
router.post("/scheduled/:id/duplicate", async (req, res) => {
    try {
        // @ts-ignore - user is added by auth middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const postId = parseInt(req.params.id);

        if (isNaN(postId)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }

        const { scheduledFor } = req.body;

        if (!scheduledFor) {
            return res.status(400).json({ error: "scheduledFor is required" });
        }

        // Duplicate the post
        const duplicatedPost = await SnapchatSchedulerService.duplicateScheduledPost(
            postId,
            userId,
            new Date(scheduledFor)
        );

        logger.info(`User ${userId} duplicated post ${postId} as post ${duplicatedPost.id}`);

        res.status(201).json({
            success: true,
            message: "Post duplicated successfully",
            post: duplicatedPost,
        });
    } catch (error: any) {
        logger.error(`Error duplicating scheduled post ${req.params.id}:`, error);

        if (error.message.includes("not found")) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (error.message.includes("Unauthorized")) {
            return res.status(403).json({ error: "Forbidden" });
        }

        res.status(400).json({
            error: error.message || "Failed to duplicate post",
        });
    }
});

/**
 * GET /api/snapchat/scheduled/stats
 * Get posting statistics for the authenticated user
 */
router.get("/scheduled/stats", async (req, res) => {
    try {
        // @ts-ignore - user is added by auth middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get stats
        const stats = await SnapchatSchedulerService.getUserPostingStats(userId);

        res.json({
            success: true,
            stats,
        });
    } catch (error: any) {
        logger.error("Error fetching posting stats:", error);
        res.status(500).json({
            error: "Failed to fetch posting stats",
        });
    }
});

/**
 * POST /api/snapchat/upload
 * Upload and process media file
 */
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        // @ts-ignore - user is added by auth middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const file = req.file;

        // Process media (validation, optimization, thumbnail generation)
        const result = await MediaProcessor.processMedia(file.buffer, file.mimetype);

        if (!result.validation.valid) {
            return res.status(400).json({
                error: "Media validation failed",
                details: result.validation.errors
            });
        }

        // Save original file
        // Use 'drafts' as temporary container for uploaded assets
        const timestamp = Date.now();
        const originalExt = path.extname(file.originalname) || (file.mimetype.startsWith("video") ? ".mp4" : ".jpg");
        const originalFilename = `upload_${timestamp}${originalExt}`;

        const savedOriginal = await LocalStorageHandler.saveFile(
            result.originalBuffer,
            userId,
            "drafts", // Store in drafts folder
            originalFilename,
            "original"
        );

        let savedThumbnail;
        if (result.thumbnailBuffer) {
            const thumbFilename = `thumb_${timestamp}.jpg`;
            savedThumbnail = await LocalStorageHandler.saveFile(
                result.thumbnailBuffer,
                userId,
                "drafts",
                thumbFilename,
                "thumbnail"
            );
        }

        logger.info(`User ${userId} uploaded media: ${savedOriginal.path}`);

        res.json({
            success: true,
            url: savedOriginal.url,
            thumbnailUrl: savedThumbnail?.url,
            mediaType: file.mimetype.startsWith("image") ? "image" : "video",
            metadata: result.metadata,
            message: "Media uploaded and processed successfully"
        });

    } catch (error: any) {
        logger.error("Error uploading media:", error);
        res.status(500).json({
            error: error.message || "Failed to upload media"
        });
    }
});

export default router;

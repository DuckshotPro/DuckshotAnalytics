/**
 * Snapchat Media Upload API Routes
 * 
 * Handles multipart file uploads for scheduled Snapchat content.
 * Provides endpoints for uploading media and checking upload status.
 */

import { Router } from "express";
import multer from "multer";
import { SnapchatPublisherService } from "../services/snapchat-publisher";
import { logger } from "../logger";

const router = Router();

// ===================================
// Multer Configuration
// ===================================

// Configure multer for file uploads (memory storage for now)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Accept only images and videos
        const allowedMimeTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "video/mp4",
            "video/quicktime", // .mov files
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only JPEG, PNG, MP4, and MOV files are allowed."));
        }
    },
});

// Track upload progress (in-memory for now, could be Redis in production)
const uploadProgress = new Map<string, {
    userId: number;
    filename: string;
    status: "uploading" | "processing" | "complete" | "failed";
    progress: number;
    url?: string;
    error?: string;
    createdAt: Date;
}>();

// ===================================
// Route Handlers
// ===================================

/**
 * POST /api/snapchat/upload
 * Upload media file for scheduled post
 */
router.post("/upload", upload.single("media"), async (req, res) => {
    try {
        // @ts-ignore - user is added by auth middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Generate upload ID
        const uploadId = `upload_${Date.now()}_${userId}_${Math.random().toString(36).substring(7)}`;

        // Track upload progress
        uploadProgress.set(uploadId, {
            userId,
            filename: req.file.originalname,
            status: "uploading",
            progress: 0,
            createdAt: new Date(),
        });

        logger.info(`User ${userId} started upload ${uploadId} (${req.file.originalname})`);

        // Validate media file
        const validation = SnapchatPublisherService.validateMedia({
            type: req.file.mimetype,
            size: req.file.size,
            // Note: Width, height, and duration would come from actual file metadata
            // This would require using libraries like ffprobe or sharp
        });

        if (!validation.valid) {
            uploadProgress.set(uploadId, {
                userId,
                filename: req.file.originalname,
                status: "failed",
                progress: 0,
                error: validation.errors.join(", "),
                createdAt: new Date(),
            });

            return res.status(400).json({
                error: "Media validation failed",
                details: validation.errors,
            });
        }

        // Update progress to processing
        uploadProgress.set(uploadId, {
            userId,
            filename: req.file.originalname,
            status: "processing",
            progress: 50,
            createdAt: new Date(),
        });

        // TODO: Upload file to storage (S3/local)
        // For now, we'll simulate this
        const mediaUrl = `https://storage.example.com/uploads/${userId}/${uploadId}/${req.file.originalname}`;
        const thumbnailUrl = req.file.mimetype.startsWith("video")
            ? `https://storage.example.com/uploads/${userId}/${uploadId}/thumbnail.jpg`
            : mediaUrl;

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update progress to complete
        uploadProgress.set(uploadId, {
            userId,
            filename: req.file.originalname,
            status: "complete",
            progress: 100,
            url: mediaUrl,
            createdAt: new Date(),
        });

        logger.info(`User ${userId} completed upload ${uploadId}`);

        res.status(200).json({
            success: true,
            uploadId,
            media: {
                url: mediaUrl,
                thumbnailUrl,
                filename: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype,
            },
        });
    } catch (error: any) {
        logger.error("Error uploading media:", error);
        res.status(500).json({
            error: error.message || "Failed to upload media",
        });
    }
});

/**
 * GET /api/snapchat/upload/:id/status
 * Check upload status
 */
router.get("/upload/:id/status", async (req, res) => {
    try {
        // @ts-ignore - user is added by auth middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const uploadId = req.params.id;

        const progress = uploadProgress.get(uploadId);

        if (!progress) {
            return res.status(404).json({ error: "Upload not found" });
        }

        // Verify user owns this upload
        if (progress.userId !== userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        res.json({
            success: true,
            upload: {
                id: uploadId,
                filename: progress.filename,
                status: progress.status,
                progress: progress.progress,
                url: progress.url,
                error: progress.error,
                createdAt: progress.createdAt,
            },
        });
    } catch (error: any) {
        logger.error(`Error fetching upload status ${req.params.id}:`, error);
        res.status(500).json({
            error: "Failed to fetch upload status",
        });
    }
});

/**
 * POST /api/snapchat/upload/batch
 * Upload multiple media files
 */
router.post("/upload/batch", upload.array("media", 10), async (req, res) => {
    try {
        // @ts-ignore - user is added by auth middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        logger.info(`User ${userId} started batch upload of ${req.files.length} files`);

        const results = await Promise.all(
            req.files.map(async (file) => {
                const uploadId = `upload_${Date.now()}_${userId}_${Math.random().toString(36).substring(7)}`;

                try {
                    // Validate media
                    const validation = SnapchatPublisherService.validateMedia({
                        type: file.mimetype,
                        size: file.size,
                    });

                    if (!validation.valid) {
                        return {
                            filename: file.originalname,
                            success: false,
                            error: validation.errors.join(", "),
                        };
                    }

                    // TODO: Upload to storage
                    const mediaUrl = `https://storage.example.com/uploads/${userId}/${uploadId}/${file.originalname}`;
                    const thumbnailUrl = file.mimetype.startsWith("video")
                        ? `https://storage.example.com/uploads/${userId}/${uploadId}/thumbnail.jpg`
                        : mediaUrl;

                    return {
                        filename: file.originalname,
                        success: true,
                        uploadId,
                        media: {
                            url: mediaUrl,
                            thumbnailUrl,
                            size: file.size,
                            mimeType: file.mimetype,
                        },
                    };
                } catch (error: any) {
                    return {
                        filename: file.originalname,
                        success: false,
                        error: error.message,
                    };
                }
            })
        );

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        logger.info(`User ${userId} batch upload complete: ${successCount} succeeded, ${failureCount} failed`);

        res.json({
            success: true,
            totalFiles: req.files.length,
            successCount,
            failureCount,
            results,
        });
    } catch (error: any) {
        logger.error("Error uploading batch media:", error);
        res.status(500).json({
            error: error.message || "Failed to upload batch media",
        });
    }
});

/**
 * DELETE /api/snapchat/upload/:id
 * Delete uploaded media (before scheduling)
 */
router.delete("/upload/:id", async (req, res) => {
    try {
        // @ts-ignore - user is added by auth middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const uploadId = req.params.id;

        const progress = uploadProgress.get(uploadId);

        if (!progress) {
            return res.status(404).json({ error: "Upload not found" });
        }

        // Verify user owns this upload
        if (progress.userId !== userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        // TODO: Delete from storage

        // Remove from tracking
        uploadProgress.delete(uploadId);

        logger.info(`User ${userId} deleted upload ${uploadId}`);

        res.json({
            success: true,
            message: "Upload deleted successfully",
        });
    } catch (error: any) {
        logger.error(`Error deleting upload ${req.params.id}:`, error);
        res.status(500).json({
            error: "Failed to delete upload",
        });
    }
});

// Cleanup old upload tracking records (run periodically)
setInterval(() => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    for (const [uploadId, progress] of uploadProgress.entries()) {
        if (progress.createdAt < oneHourAgo && progress.status === "complete") {
            uploadProgress.delete(uploadId);
        }
    }
}, 15 * 60 * 1000); // Run every 15 minutes

export default router;

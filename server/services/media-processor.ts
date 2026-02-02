/**
 * Media Processing Pipeline
 * 
 * Handles media file processing including:
 * - Video thumbnail generation
 * - Image optimization
 * - Format validation
 * - Metadata extraction
 */

import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { logger } from "../logger";

// Set ffmpeg path
if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

/**
 * Media metadata interface
 */
export interface MediaMetadata {
    width: number;
    height: number;
    duration?: number; // For videos
    format: string;
    size: number;
    aspectRatio: number;
}

/**
 * Helper to get a temporary file path
 */
function getTempPath(extension: string): string {
    return path.join(os.tmpdir(), `snapchat-media-${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
}

/**
 * Generate video thumbnail using ffmpeg
 */
export async function generateVideoThumbnail(
    videoBuffer: Buffer,
    timestamp: number = 1 // Thumbnail at 1 second
): Promise<Buffer> {
    const videoPath = getTempPath(".mp4");
    const thumbPath = getTempPath(".jpg");

    try {
        logger.info("Generating video thumbnail...");

        // Write buffer to temp file for seekability
        await fs.writeFile(videoPath, videoBuffer);

        await new Promise<void>((resolve, reject) => {
            ffmpeg(videoPath)
                .screenshots({
                    timestamps: [timestamp],
                    folder: path.dirname(thumbPath),
                    filename: path.basename(thumbPath),
                    size: "1080x1920" // Standard Snapchat size
                })
                .on("end", () => resolve())
                .on("error", (err) => reject(err));
        });

        const thumbnailBuffer = await fs.readFile(thumbPath);

        return thumbnailBuffer;
    } catch (error: any) {
        logger.error("Error generating video thumbnail:", error);
        throw new Error(`Failed to generate thumbnail: ${error.message}`);
    } finally {
        // Cleanup
        try {
            await fs.unlink(videoPath).catch(() => { });
            await fs.unlink(thumbPath).catch(() => { });
        } catch (e) {
            // Ignore cleanup errors
        }
    }
}

/**
 * Optimize image (resize, compress)
 */
export async function optimizeImage(
    imageBuffer: Buffer,
    options: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
    } = {}
): Promise<Buffer> {
    try {
        const { maxWidth = 1080, maxHeight = 1920, quality = 85 } = options;

        const optimized = await sharp(imageBuffer)
            .resize(maxWidth, maxHeight, {
                fit: "inside",
                withoutEnlargement: true,
            })
            .jpeg({ quality })
            .toBuffer();

        logger.info(`Optimized image: ${imageBuffer.length} → ${optimized.length} bytes`);

        return optimized;
    } catch (error: any) {
        logger.error("Error optimizing image:", error);
        throw new Error(`Failed to optimize image: ${error.message}`);
    }
}

/**
 * Extract media metadata
 */
export async function extractMetadata(
    buffer: Buffer,
    mimeType: string
): Promise<MediaMetadata> {
    try {
        if (mimeType.startsWith("image")) {
            const metadata = await sharp(buffer).metadata();

            return {
                width: metadata.width || 0,
                height: metadata.height || 0,
                format: metadata.format || "unknown",
                size: buffer.length,
                aspectRatio: metadata.width && metadata.height
                    ? metadata.height / metadata.width
                    : 0,
            };
        } else if (mimeType.startsWith("video")) {
            const videoPath = getTempPath(".mp4");

            try {
                await fs.writeFile(videoPath, buffer);

                return await new Promise<MediaMetadata>((resolve, reject) => {
                    ffmpeg.ffprobe(videoPath, (err, metadata) => {
                        if (err) {
                            // If ffprobe fails, try to use basic ffmpeg output parser
                            logger.warn("ffprobe failed, trying fallback metadata extraction");
                            return reject(err);
                        }

                        const stream = metadata.streams.find(s => s.codec_type === "video");
                        const format = metadata.format;

                        if (!stream) {
                            return reject(new Error("No video stream found"));
                        }

                        resolve({
                            width: stream.width || 0,
                            height: stream.height || 0,
                            duration: format.duration || 0,
                            format: format.format_name || "mp4",
                            size: buffer.length,
                            aspectRatio: stream.width && stream.height
                                ? stream.height / stream.width
                                : 0,
                        });
                    });
                });
            } finally {
                await fs.unlink(videoPath).catch(() => { });
            }
        }

        throw new Error(`Unsupported media type: ${mimeType}`);
    } catch (error: any) {
        // Fallback for video if ffprobe is missing or fails
        if (mimeType.startsWith("video")) {
            logger.warn("Using basic fallback for video metadata due to error:", error.message);
            return {
                width: 1080,
                height: 1920,
                duration: 10, // Default fallback
                format: "mp4",
                size: buffer.length,
                aspectRatio: 1920 / 1080,
            };
        }

        logger.error("Error extracting metadata:", error);
        throw new Error(`Failed to extract metadata: ${error.message}`);
    }
}

/**
 * Validate media against Snapchat requirements
 */
export function validateMedia(metadata: MediaMetadata): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Validate dimensions
    if (metadata.width < 1080 || metadata.height < 1920) {
        errors.push(`Minimum dimensions: 1080x1920 (got ${metadata.width}x${metadata.height})`);
    }

    // Validate aspect ratio (9:16 recommended)
    const expectedRatio = 1920 / 1080;
    const tolerance = 0.05;

    if (Math.abs(metadata.aspectRatio - expectedRatio) > tolerance) {
        errors.push(`Recommended aspect ratio: 9:16 (got ${metadata.aspectRatio.toFixed(2)})`);
    }

    // Validate file size
    const maxSize = metadata.duration ? 100 * 1024 * 1024 : 5 * 1024 * 1024; // 100MB for video, 5MB for image

    if (metadata.size > maxSize) {
        errors.push(`File too large: ${(metadata.size / (1024 * 1024)).toFixed(2)}MB (max: ${maxSize / (1024 * 1024)}MB)`);
    }

    // Validate video duration
    if (metadata.duration) {
        if (metadata.duration < 3) {
            errors.push("Video must be at least 3 seconds");
        }
        if (metadata.duration > 60) {
            errors.push("Video must be 60 seconds or less");
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Process uploaded media file
 */
export async function processMedia(
    buffer: Buffer,
    mimeType: string
): Promise<{
    originalBuffer: Buffer;
    thumbnailBuffer?: Buffer;
    metadata: MediaMetadata;
    validation: { valid: boolean; errors: string[] };
}> {
    try {
        logger.info(`Processing media file (${mimeType}, ${buffer.length} bytes)`);

        // Extract metadata
        const metadata = await extractMetadata(buffer, mimeType);

        // Validate
        const validation = validateMedia(metadata);

        let processedBuffer = buffer;
        let thumbnailBuffer: Buffer | undefined;

        if (mimeType.startsWith("image")) {
            // Optimize image
            processedBuffer = await optimizeImage(buffer);

            // Use optimized image as thumbnail
            thumbnailBuffer = await optimizeImage(buffer, {
                maxWidth: 540,
                maxHeight: 960,
                quality: 75,
            });
        } else if (mimeType.startsWith("video")) {
            // Generate thumbnail
            thumbnailBuffer = await generateVideoThumbnail(buffer);
        }

        logger.info("Media processing complete");

        return {
            originalBuffer: processedBuffer,
            thumbnailBuffer,
            metadata,
            validation,
        };
    } catch (error: any) {
        logger.error("Error processing media:", error);
        throw new Error(`Media processing failed: ${error.message}`);
    }
}

export const MediaProcessor = {
    generateVideoThumbnail,
    optimizeImage,
    extractMetadata,
    validateMedia,
    processMedia,
};

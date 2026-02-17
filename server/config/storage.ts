/**
 * Storage Configuration
 * 
 * Configures media storage for scheduled Snapchat content.
 * Supports both local storage (development) and S3-compatible storage (production).
 */

import fs from "fs/promises";
import path from "path";
import { logger } from "../logger";

/**
 * Storage provider types
 */
export enum StorageProvider {
    LOCAL = "local",
    S3 = "s3",
}

/**
 * Storage configuration
 */
interface StorageConfig {
    provider: StorageProvider;
    basePath: string; // Base path for local storage or S3 bucket name
    publicUrl?: string; // Public URL base for accessing files
    s3Config?: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        endpoint?: string; // For S3-compatible services
    };
}

/**
 * Get storage configuration from environment
 */
export function getStorageConfig(): StorageConfig {
    const provider = (process.env.STORAGE_PROVIDER || "local") as StorageProvider;

    if (provider === StorageProvider.S3) {
        return {
            provider: StorageProvider.S3,
            basePath: process.env.S3_BUCKET || "ducksnapanalytics-uploads",
            publicUrl: process.env.S3_PUBLIC_URL,
            s3Config: {
                region: process.env.S3_REGION || "us-east-1",
                accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
                endpoint: process.env.S3_ENDPOINT, // For MinIO, DigitalOcean Spaces, etc.
            },
        };
    }

    // Local storage configuration
    return {
        provider: StorageProvider.LOCAL,
        basePath: process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), "uploads"),
        publicUrl: process.env.LOCAL_STORAGE_URL || "/uploads",
    };
}

/**
 * Storage directory structure
 */
export function getStoragePaths(userId: number, postId: number | string) {
    return {
        userDir: `snapchat/scheduled/${userId}`,
        postDir: `snapchat/scheduled/${userId}/${postId}`,
        originalFile: (filename: string) => `snapchat/scheduled/${userId}/${postId}/original/${filename}`,
        thumbnail: (filename: string) => `snapchat/scheduled/${userId}/${postId}/thumbnails/${filename}`,
    };
}

/**
 * Ensure local storage directories exist
 */
export async function ensureLocalDirectories(basePath: string) {
    const directories = [
        basePath,
        path.join(basePath, "snapchat"),
        path.join(basePath, "snapchat", "scheduled"),
    ];

    for (const dir of directories) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
            logger.info(`Storage: Created directory ${dir}`);
        }
    }
}

/**
 * Initialize storage based on configuration
 */
export async function initializeStorage(): Promise<StorageConfig> {
    const config = getStorageConfig();

    logger.info(`Storage: Initializing ${config.provider} storage`);

    if (config.provider === StorageProvider.LOCAL) {
        // Create local storage directories
        await ensureLocalDirectories(config.basePath);
        logger.info(`Storage: Local storage initialized at ${config.basePath}`);
    } else if (config.provider === StorageProvider.S3) {
        // Validate S3 configuration
        if (!config.s3Config?.accessKeyId || !config.s3Config?.secretAccessKey) {
            throw new Error("S3 storage requires S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY");
        }
        logger.info(`Storage: S3 storage initialized (bucket: ${config.basePath})`);
    }

    return config;
}

/**
 * Get file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
    const mimeMap: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "video/mp4": ".mp4",
        "video/quicktime": ".mov",
    };

    return mimeMap[mimeType] || "";
}

/**
 * Generate unique filename
 */
export function generateFilename(originalFilename: string, prefix: string = ""): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(originalFilename);
    const name = path.basename(originalFilename, ext);

    return `${prefix}${name}_${timestamp}_${random}${ext}`;
}

/**
 * Calculate storage quota usage for a user
 */
export async function getUserStorageUsage(userId: number, basePath: string): Promise<{
    totalBytes: number;
    fileCount: number;
    formattedSize: string;
}> {
    try {
        const userDir = path.join(basePath, "snapchat", "scheduled", userId.toString());

        let totalBytes = 0;
        let fileCount = 0;

        async function calculateDirSize(dir: string) {
            try {
                const files = await fs.readdir(dir, { withFileTypes: true });

                for (const file of files) {
                    const filePath = path.join(dir, file.name);

                    if (file.isDirectory()) {
                        await calculateDirSize(filePath);
                    } else {
                        const stats = await fs.stat(filePath);
                        totalBytes += stats.size;
                        fileCount++;
                    }
                }
            } catch (error) {
                // Directory doesn't exist or not accessible
            }
        }

        await calculateDirSize(userDir);

        return {
            totalBytes,
            fileCount,
            formattedSize: formatBytes(totalBytes),
        };
    } catch (error) {
        return {
            totalBytes: 0,
            fileCount: 0,
            formattedSize: "0 B",
        };
    }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Clean up old files (for scheduled posts that are published/cancelled)
 */
export async function cleanupOldFiles(
    basePath: string,
    olderThanDays: number = 30
): Promise<{
    deletedFiles: number;
    freedBytes: number;
}> {
    let deletedFiles = 0;
    let freedBytes = 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    async function cleanupDir(dir: string) {
        try {
            const files = await fs.readdir(dir, { withFileTypes: true });

            for (const file of files) {
                const filePath = path.join(dir, file.name);

                if (file.isDirectory()) {
                    await cleanupDir(filePath);

                    // Try to remove empty directories
                    try {
                        const contents = await fs.readdir(filePath);
                        if (contents.length === 0) {
                            await fs.rmdir(filePath);
                        }
                    } catch { }
                } else {
                    const stats = await fs.stat(filePath);

                    if (stats.mtime < cutoffDate) {
                        freedBytes += stats.size;
                        await fs.unlink(filePath);
                        deletedFiles++;
                    }
                }
            }
        } catch (error) {
            logger.error(`Error cleaning up directory ${dir}:`, error);
        }
    }

    const scheduledDir = path.join(basePath, "snapchat", "scheduled");
    await cleanupDir(scheduledDir);

    logger.info(`Storage cleanup: Deleted ${deletedFiles} files, freed ${formatBytes(freedBytes)}`);

    return { deletedFiles, freedBytes };
}

// Export singleton config
let storageConfig: StorageConfig | null = null;

export async function getOrInitializeStorage(): Promise<StorageConfig> {
    if (!storageConfig) {
        storageConfig = await initializeStorage();
    }
    return storageConfig;
}

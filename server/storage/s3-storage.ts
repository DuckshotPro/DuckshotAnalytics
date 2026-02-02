/**
 * S3 Storage Handler
 * 
 * Handles file operations for S3-compatible storage (AWS S3, MinIO, DigitalOcean Spaces).
 * Provides upload, download, delete, and URL generation functionality.
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getStorageConfig, getStoragePaths, generateFilename } from "../config/storage";
import { logger } from "../logger";

let s3Client: S3Client | null = null;

/**
 * Initialize S3 client
 */
function getS3Client(): S3Client {
    if (!s3Client) {
        const config = getStorageConfig();

        if (!config.s3Config) {
            throw new Error("S3 configuration not found");
        }

        s3Client = new S3Client({
            region: config.s3Config.region,
            credentials: {
                accessKeyId: config.s3Config.accessKeyId,
                secretAccessKey: config.s3Config.secretAccessKey,
            },
            endpoint: config.s3Config.endpoint, // For S3-compatible services
        });

        logger.info("S3 client initialized");
    }

    return s3Client;
}

/**
 * Upload a file to S3
 */
export async function saveFile(
    buffer: Buffer,
    userId: number,
    postId: number | string,
    filename: string,
    mimeType: string,
    type: "original" | "thumbnail" = "original"
): Promise<{
    path: string;
    url: string;
    size: number;
}> {
    try {
        const client = getS3Client();
        const config = getStorageConfig();
        const paths = getStoragePaths(userId, postId);

        // Generate unique filename
        const uniqueFilename = generateFilename(filename);

        // Determine S3 key based on type
        const key = type === "thumbnail"
            ? paths.thumbnail(uniqueFilename)
            : paths.originalFile(uniqueFilename);

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: config.basePath,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
            // Optional: Add metadata
            Metadata: {
                userId: userId.toString(),
                postId: postId.toString(),
                uploadedAt: new Date().toISOString(),
            },
        });

        await client.send(command);

        logger.info(`S3: Uploaded file ${uniqueFilename} to bucket ${config.basePath}`);

        // Generate public URL
        const url = config.publicUrl
            ? `${config.publicUrl}/${key}`
            : `https://${config.basePath}.s3.${config.s3Config!.region}.amazonaws.com/${key}`;

        return {
            path: key,
            url,
            size: buffer.length,
        };
    } catch (error: any) {
        logger.error("S3: Error uploading file:", error);
        throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
}

/**
 * Download a file from S3
 */
export async function readFile(key: string): Promise<Buffer> {
    try {
        const client = getS3Client();
        const config = getStorageConfig();

        const command = new GetObjectCommand({
            Bucket: config.basePath,
            Key: key,
        });

        const response = await client.send(command);

        if (!response.Body) {
            throw new Error("No file data received from S3");
        }

        // Convert stream to buffer
        const chunks: Uint8Array[] = [];
        for await (const chunk of response.Body as any) {
            chunks.push(chunk);
        }

        const buffer = Buffer.concat(chunks);

        logger.debug(`S3: Downloaded file ${key}`);

        return buffer;
    } catch (error: any) {
        logger.error(`S3: Error downloading file ${key}:`, error);
        throw new Error(`Failed to download file from S3: ${error.message}`);
    }
}

/**
 * Delete a file from S3
 */
export async function deleteFile(key: string): Promise<void> {
    try {
        const client = getS3Client();
        const config = getStorageConfig();

        const command = new DeleteObjectCommand({
            Bucket: config.basePath,
            Key: key,
        });

        await client.send(command);

        logger.info(`S3: Deleted file ${key}`);
    } catch (error: any) {
        logger.error(`S3: Error deleting file ${key}:`, error);
        throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
}

/**
 * Delete all files for a post (by prefix)
 */
export async function deletePostFiles(
    userId: number,
    postId: number | string
): Promise<{
    deletedFiles: number;
    freedBytes: number;
}> {
    try {
        const paths = getStoragePaths(userId, postId);

        // In a production system, you'd list all objects with the prefix and delete them
        // For now, we'll assume specific files

        logger.info(`S3: Would delete files for post ${postId}`);

        return { deletedFiles: 0, freedBytes: 0 };
    } catch (error: any) {
        logger.error("S3: Error deleting post files:", error);
        throw new Error(`Failed to delete post files from S3: ${error.message}`);
    }
}

/**
 * Check if a file exists in S3
 */
export async function fileExists(key: string): Promise<boolean> {
    try {
        const client = getS3Client();
        const config = getStorageConfig();

        const command = new HeadObjectCommand({
            Bucket: config.basePath,
            Key: key,
        });

        await client.send(command);
        return true;
    } catch (error: any) {
        if (error.name === "NotFound") {
            return false;
        }
        throw error;
    }
}

/**
 * Get file metadata from S3
 */
export async function getFileMetadata(key: string): Promise<{
    size: number;
    created: Date;
    modified: Date;
    contentType?: string;
}> {
    try {
        const client = getS3Client();
        const config = getStorageConfig();

        const command = new HeadObjectCommand({
            Bucket: config.basePath,
            Key: key,
        });

        const response = await client.send(command);

        return {
            size: response.ContentLength || 0,
            created: response.LastModified || new Date(),
            modified: response.LastModified || new Date(),
            contentType: response.ContentType,
        };
    } catch (error: any) {
        logger.error("S3: Error getting file metadata:", error);
        throw new Error(`Failed to get file metadata from S3: ${error.message}`);
    }
}

/**
 * Generate presigned URL for temporary access
 */
export async function getPresignedUrl(
    key: string,
    expiresIn: number = 3600 // 1 hour
): Promise<string> {
    try {
        const client = getS3Client();
        const config = getStorageConfig();

        const command = new GetObjectCommand({
            Bucket: config.basePath,
            Key: key,
        });

        const url = await getSignedUrl(client, command, { expiresIn });

        logger.debug(`S3: Generated presigned URL for ${key}`);

        return url;
    } catch (error: any) {
        logger.error("S3: Error generating presigned URL:", error);
        throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
}

/**
 * Copy a file within S3
 */
export async function copyFile(
    sourceKey: string,
    destinationKey: string
): Promise<void> {
    try {
        const client = getS3Client();
        const config = getStorageConfig();

        // Download from source
        const sourceData = await readFile(sourceKey);

        // Get source metadata
        const metadata = await getFileMetadata(sourceKey);

        // Upload to destination
        const command = new PutObjectCommand({
            Bucket: config.basePath,
            Key: destinationKey,
            Body: sourceData,
            ContentType: metadata.contentType,
        });

        await client.send(command);

        logger.info(`S3: Copied file from ${sourceKey} to ${destinationKey}`);
    } catch (error: any) {
        logger.error("S3: Error copying file:", error);
        throw new Error(`Failed to copy file in S3: ${error.message}`);
    }
}

export const S3StorageHandler = {
    saveFile,
    readFile,
    deleteFile,
    deletePostFiles,
    fileExists,
    getFileMetadata,
    getPresignedUrl,
    copyFile,
};

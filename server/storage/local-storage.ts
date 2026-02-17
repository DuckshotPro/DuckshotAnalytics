/**
 * Local Storage Handler
 * 
 * Handles file operations for local storage (development/self-hosted).
 * Provides upload, download, delete, and URL generation functionality.
 */

import fs from "fs/promises";
import path from "path";
import {
    getStorageConfig,
    getStoragePaths,
    generateFilename,
    ensureLocalDirectories,
} from "../config/storage";
import { logger } from "../logger";

/**
 * Save a file to local storage
 */
export async function saveFile(
    buffer: Buffer,
    userId: number,
    postId: number | string,
    filename: string,
    type: "original" | "thumbnail" = "original"
): Promise<{
    path: string;
    url: string;
    size: number;
}> {
    try {
        const config = getStorageConfig();
        const paths = getStoragePaths(userId, postId);

        // Generate unique filename
        const uniqueFilename = generateFilename(filename);

        // Determine file path based on type
        const relativePath = type === "thumbnail"
            ? paths.thumbnail(uniqueFilename)
            : paths.originalFile(uniqueFilename);

        const fullPath = path.join(config.basePath, relativePath);
        const directory = path.dirname(fullPath);

        // Ensure directory exists
        await fs.mkdir(directory, { recursive: true });

        // Write file
        await fs.writeFile(fullPath, buffer);

        const stats = await fs.stat(fullPath);

        logger.info(`Local Storage: Saved file ${uniqueFilename} (${stats.size} bytes)`);

        return {
            path: relativePath,
            url: `${config.publicUrl}/${relativePath.replace(/\\/g, "/")}`,
            size: stats.size,
        };
    } catch (error: any) {
        logger.error("Local Storage: Error saving file:", error);
        throw new Error(`Failed to save file: ${error.message}`);
    }
}

/**
 * Read a file from local storage
 */
export async function readFile(filePath: string): Promise<Buffer> {
    try {
        const config = getStorageConfig();
        const fullPath = path.join(config.basePath, filePath);

        const buffer = await fs.readFile(fullPath);

        logger.debug(`Local Storage: Read file ${filePath}`);

        return buffer;
    } catch (error: any) {
        logger.error(`Local Storage: Error reading file ${filePath}:`, error);
        throw new Error(`Failed to read file: ${error.message}`);
    }
}

/**
 * Delete a file from local storage
 */
export async function deleteFile(filePath: string): Promise<void> {
    try {
        const config = getStorageConfig();
        const fullPath = path.join(config.basePath, filePath);

        await fs.unlink(fullPath);

        logger.info(`Local Storage: Deleted file ${filePath}`);

        // Try to clean up empty directories
        const directory = path.dirname(fullPath);
        try {
            const contents = await fs.readdir(directory);
            if (contents.length === 0) {
                await fs.rmdir(directory);
                logger.debug(`Local Storage: Removed empty directory ${directory}`);
            }
        } catch {
            // Ignore errors when cleaning up directories
        }
    } catch (error: any) {
        logger.error(`Local Storage: Error deleting file ${filePath}:`, error);
        throw new Error(`Failed to delete file: ${error.message}`);
    }
}

/**
 * Delete all files for a post
 */
export async function deletePostFiles(
    userId: number,
    postId: number | string
): Promise<{
    deletedFiles: number;
    freedBytes: number;
}> {
    try {
        const config = getStorageConfig();
        const paths = getStoragePaths(userId, postId);
        const postDir = path.join(config.basePath, paths.postDir);

        let deletedFiles = 0;
        let freedBytes = 0;

        async function deleteDirectory(dir: string) {
            try {
                const files = await fs.readdir(dir, { withFileTypes: true });

                for (const file of files) {
                    const filePath = path.join(dir, file.name);

                    if (file.isDirectory()) {
                        await deleteDirectory(filePath);
                    } else {
                        const stats = await fs.stat(filePath);
                        freedBytes += stats.size;
                        await fs.unlink(filePath);
                        deletedFiles++;
                    }
                }

                await fs.rmdir(dir);
            } catch (error) {
                // Directory might not exist
            }
        }

        await deleteDirectory(postDir);

        logger.info(`Local Storage: Deleted ${deletedFiles} files for post ${postId} (freed ${freedBytes} bytes)`);

        return { deletedFiles, freedBytes };
    } catch (error: any) {
        logger.error(`Local Storage: Error deleting post files:`, error);
        throw new Error(`Failed to delete post files: ${error.message}`);
    }
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
    try {
        const config = getStorageConfig();
        const fullPath = path.join(config.basePath, filePath);

        await fs.access(fullPath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(filePath: string): Promise<{
    size: number;
    created: Date;
    modified: Date;
}> {
    try {
        const config = getStorageConfig();
        const fullPath = path.join(config.basePath, filePath);

        const stats = await fs.stat(fullPath);

        return {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
        };
    } catch (error: any) {
        logger.error(`Local Storage: Error getting file metadata:`, error);
        throw new Error(`Failed to get file metadata: ${error.message}`);
    }
}

/**
 * Copy a file within storage
 */
export async function copyFile(
    sourcePath: string,
    destinationPath: string
): Promise<void> {
    try {
        const config = getStorageConfig();
        const sourceFullPath = path.join(config.basePath, sourcePath);
        const destFullPath = path.join(config.basePath, destinationPath);

        // Ensure destination directory exists
        const destDir = path.dirname(destFullPath);
        await fs.mkdir(destDir, { recursive: true });

        // Copy file
        await fs.copyFile(sourceFullPath, destFullPath);

        logger.info(`Local Storage: Copied file from ${sourcePath} to ${destinationPath}`);
    } catch (error: any) {
        logger.error("Local Storage: Error copying file:", error);
        throw new Error(`Failed to copy file: ${error.message}`);
    }
}

/**
 * Move a file within storage
 */
export async function moveFile(
    sourcePath: string,
    destinationPath: string
): Promise<void> {
    try {
        const config = getStorageConfig();
        const sourceFullPath = path.join(config.basePath, sourcePath);
        const destFullPath = path.join(config.basePath, destinationPath);

        // Ensure destination directory exists
        const destDir = path.dirname(destFullPath);
        await fs.mkdir(destDir, { recursive: true });

        // Move file
        await fs.rename(sourceFullPath, destFullPath);

        logger.info(`Local Storage: Moved file from ${sourcePath} to ${destinationPath}`);
    } catch (error: any) {
        logger.error("Local Storage: Error moving file:", error);
        throw new Error(`Failed to move file: ${error.message}`);
    }
}

/**
 * List all files for a user
 */
export async function listUserFiles(userId: number): Promise<Array<{
    path: string;
    size: number;
    modified: Date;
}>> {
    try {
        const config = getStorageConfig();
        const paths = getStoragePaths(userId, "");
        const userDir = path.join(config.basePath, paths.userDir);

        const files: Array<{ path: string; size: number; modified: Date }> = [];

        async function scanDirectory(dir: string, relativePath: string = "") {
            try {
                const items = await fs.readdir(dir, { withFileTypes: true });

                for (const item of items) {
                    const itemPath = path.join(dir, item.name);
                    const itemRelativePath = path.join(relativePath, item.name);

                    if (item.isDirectory()) {
                        await scanDirectory(itemPath, itemRelativePath);
                    } else {
                        const stats = await fs.stat(itemPath);
                        files.push({
                            path: itemRelativePath,
                            size: stats.size,
                            modified: stats.mtime,
                        });
                    }
                }
            } catch (error) {
                // Directory might not exist
            }
        }

        await scanDirectory(userDir);

        return files;
    } catch (error: any) {
        logger.error("Local Storage: Error listing user files:", error);
        throw new Error(`Failed to list user files: ${error.message}`);
    }
}

export const LocalStorageHandler = {
    saveFile,
    readFile,
    deleteFile,
    deletePostFiles,
    fileExists,
    getFileMetadata,
    copyFile,
    moveFile,
    listUserFiles,
};

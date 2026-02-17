import multer from "multer";

/**
 * Configure Multer for memory storage
 * Files are stored in memory to be processed immediately by MediaProcessor
 */
const storage = multer.memoryStorage();

/**
 * Multer upload middleware
 * Limit file size to 100MB (Snapchat video max is close to this, though usually less)
 */
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 150 * 1024 * 1024, // 150MB limit to be safe
        files: 1, // Max 1 file per request
    },
});

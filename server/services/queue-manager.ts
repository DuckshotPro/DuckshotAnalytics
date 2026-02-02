/**
 * Publishing Queue Manager
 * 
 * Manages the queue of posts to be published to Snapchat.
 * Implements priority queue, rate limiting, and concurrency control.
 */

import { logger } from "../logger";

/**
 * Queue item representing a post to be published
 */
interface QueueItem {
    postId: number;
    scheduledFor: Date;
    retryCount: number;
    priority: number; // Higher priority = published first
    addedAt: Date;
}

/**
 * Queue manager configuration
 */
interface QueueManagerConfig {
    maxConcurrent: number; // Maximum concurrent publish operations
    rateLimit: number; // Maximum publishes per minute
    retryDelays: number[]; // Retry delays in minutes [1, 5, 15]
}

/**
 * Publishing Queue Manager
 */
export class PublishingQueueManager {
    private queue: QueueItem[] = [];
    private processing = new Set<number>(); // Currently processing post IDs
    private publishedThisMinute = 0;
    private lastMinuteReset = Date.now();
    private config: QueueManagerConfig;

    constructor(config: Partial<QueueManagerConfig> = {}) {
        this.config = {
            maxConcurrent: config.maxConcurrent || 3,
            rateLimit: config.rateLimit || 10,
            retryDelays: config.retryDelays || [1, 5, 15],
        };

        // Reset rate limit counter every minute
        setInterval(() => {
            this.publishedThisMinute = 0;
            this.lastMinuteReset = Date.now();
        }, 60 * 1000);
    }

    /**
     * Add a post to the queue
     */
    add(item: Omit<QueueItem, "addedAt" | "priority">) {
        // Calculate priority (overdue posts get higher priority)
        const now = new Date();
        const delayMinutes = Math.max(0, (now.getTime() - item.scheduledFor.getTime()) / (60 * 1000));
        const priority = Math.floor(delayMinutes);

        const queueItem: QueueItem = {
            ...item,
            priority,
            addedAt: new Date(),
        };

        this.queue.push(queueItem);

        // Sort queue by priority (highest first), then by scheduled time (earliest first)
        this.queue.sort((a, b) => {
            if (a.priority !== b.priority) {
                return b.priority - a.priority; // Higher priority first
            }
            return a.scheduledFor.getTime() - b.scheduledFor.getTime(); // Earlier first
        });

        logger.debug(`Queue: Added post ${item.postId} with priority ${priority} (queue size: ${this.queue.length})`);
    }

    /**
     * Remove a post from the queue
     */
    remove(postId: number) {
        const index = this.queue.findIndex(item => item.postId === postId);
        if (index !== -1) {
            this.queue.splice(index, 1);
            logger.debug(`Queue: Removed post ${postId} (queue size: ${this.queue.length})`);
        }
        this.processing.delete(postId);
    }

    /**
     * Get the next post to publish (respecting concurrency and rate limits)
     */
    getNext(): QueueItem | null {
        // Check concurrency limit
        if (this.processing.size >= this.config.maxConcurrent) {
            logger.debug(`Queue: At max concurrency (${this.processing.size}/${this.config.maxConcurrent})`);
            return null;
        }

        // Check rate limit
        if (this.publishedThisMinute >= this.config.rateLimit) {
            logger.debug(`Queue: Rate limit reached (${this.publishedThisMinute}/${this.config.rateLimit} this minute)`);
            return null;
        }

        // Get next item from queue
        const item = this.queue.find(item => !this.processing.has(item.postId));

        if (item) {
            this.processing.add(item.postId);
            this.publishedThisMinute++;
            logger.debug(`Queue: Processing post ${item.postId} (${this.processing.size} active, ${this.publishedThisMinute}/${this.config.rateLimit} this minute)`);
        }

        return item || null;
    }

    /**
     * Mark a post as processed (success or failure)
     */
    markProcessed(postId: number, success: boolean) {
        this.remove(postId);

        if (success) {
            logger.debug(`Queue: Post ${postId} published successfully`);
        } else {
            logger.debug(`Queue: Post ${postId} failed to publish`);
        }
    }

    /**
     * Get retry delay for a post based on retry count
     */
    getRetryDelay(retryCount: number): number {
        const delayIndex = Math.min(retryCount, this.config.retryDelays.length - 1);
        return this.config.retryDelays[delayIndex];
    }

    /**
     * Check if a post should be retried
     */
    shouldRetry(retryCount: number, maxRetries: number): boolean {
        return retryCount < maxRetries;
    }

    /**
     * Get queue statistics
     */
    getStats() {
        return {
            queueSize: this.queue.length,
            processing: this.processing.size,
            publishedThisMinute: this.publishedThisMinute,
            rateLimit: this.config.rateLimit,
            maxConcurrent: this.config.maxConcurrent,
            availableSlots: this.config.maxConcurrent - this.processing.size,
            rateLimitRemaining: this.config.rateLimit - this.publishedThisMinute,
        };
    }

    /**
     * Get the current queue
     */
    getQueue(): QueueItem[] {
        return [...this.queue];
    }

    /**
     * Clear the queue
     */
    clear() {
        this.queue = [];
        this.processing.clear();
        logger.info("Queue: Cleared all items");
    }

    /**
     * Get the dead letter queue (posts that exceeded max retries)
     */
    getDeadLetterQueue(): QueueItem[] {
        // In a production system, this would be stored separately
        // For now, we'll return an empty array
        return [];
    }
}

// Export singleton instance
export const publishingQueue = new PublishingQueueManager();

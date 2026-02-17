/**
 * Retry Handler Service
 * 
 * Implements retry logic with exponential backoff for failed publish attempts.
 * Manages retry scheduling and failure tracking.
 */

import { logger } from "../logger";

/**
 * Retry strategy configuration
 */
interface RetryConfig {
    maxRetries: number;
    baseDelay: number; // Base delay in milliseconds
    maxDelay: number; // Maximum delay in milliseconds
    backoffMultiplier: number; // Exponential backoff multiplier
}

/**
 * Retry attempt result
 */
interface RetryAttempt {
    attempt: number;
    timestamp: Date;
    success: boolean;
    error?: string;
    nextRetryAt?: Date;
}

/**
 * Default retry strategy:
 * Attempt 1: Immediate (0 min)
 * Attempt 2: +1 minute
 * Attempt 3: +5 minutes
 * Attempt 4: +15 minutes (final)
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 4,
    baseDelay: 60 * 1000, // 1 minute in milliseconds
    maxDelay: 15 * 60 * 1000, // 15 minutes in milliseconds
    backoffMultiplier: 5,
};

/**
 * Calculate delay for next retry attempt using exponential backoff
 */
export function calculateRetryDelay(
    attempt: number,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
    if (attempt === 0) {
        return 0; // Immediate first attempt
    }

    // Exponential backoff: baseDelay * (multiplier ^ (attempt - 1))
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);

    // Cap at max delay
    return Math.min(delay, config.maxDelay);
}

/**
 * Get next retry time based on attempt number
 */
export function getNextRetryTime(
    attempt: number,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
): Date {
    const delay = calculateRetryDelay(attempt, config);
    return new Date(Date.now() + delay);
}

/**
 * Check if a post should be retried
 */
export function shouldRetry(
    currentAttempt: number,
    maxRetries: number = DEFAULT_RETRY_CONFIG.maxRetries
): boolean {
    return currentAttempt < maxRetries;
}

/**
 * Get retry strategy description
 */
export function getRetryStrategy(config: RetryConfig = DEFAULT_RETRY_CONFIG): string[] {
    const strategy: string[] = [];

    for (let i = 0; i < config.maxRetries; i++) {
        const delay = calculateRetryDelay(i, config);
        const minutes = Math.round(delay / (60 * 1000));

        if (i === 0) {
            strategy.push(`Attempt ${i + 1}: Immediate`);
        } else if (i === config.maxRetries - 1) {
            strategy.push(`Attempt ${i + 1}: +${minutes} minute${minutes !== 1 ? 's' : ''} (final)`);
        } else {
            strategy.push(`Attempt ${i + 1}: +${minutes} minute${minutes !== 1 ? 's' : ''}`);
        }
    }

    return strategy;
}

/**
 * Categorize errors for retry decisions
 */
export function categorizeError(error: string): {
    category: string;
    shouldRetry: boolean;
    reason: string;
} {
    const errorLower = error.toLowerCase();

    // Network errors - always retry
    if (errorLower.includes('network') ||
        errorLower.includes('timeout') ||
        errorLower.includes('econnrefused') ||
        errorLower.includes('enotfound')) {
        return {
            category: 'network',
            shouldRetry: true,
            reason: 'Network errors are typically transient',
        };
    }

    // Rate limiting - retry with backoff
    if (errorLower.includes('rate limit') ||
        errorLower.includes('too many requests') ||
        errorLower.includes('429')) {
        return {
            category: 'rate_limit',
            shouldRetry: true,
            reason: 'Rate limits are temporary',
        };
    }

    // Authentication errors - might need user action
    if (errorLower.includes('unauthorized') ||
        errorLower.includes('invalid token') ||
        errorLower.includes('expired token') ||
        errorLower.includes('401')) {
        return {
            category: 'auth',
            shouldRetry: false,
            reason: 'Authentication errors require user intervention',
        };
    }

    // Server errors - retry
    if (errorLower.includes('500') ||
        errorLower.includes('502') ||
        errorLower.includes('503') ||
        errorLower.includes('504') ||
        errorLower.includes('internal server error')) {
        return {
            category: 'server_error',
            shouldRetry: true,
            reason: 'Server errors may be temporary',
        };
    }

    // Client errors (4xx) - generally don't retry
    if (errorLower.includes('400') ||
        errorLower.includes('403') ||
        errorLower.includes('404')) {
        return {
            category: 'client_error',
            shouldRetry: false,
            reason: 'Client errors indicate invalid request',
        };
    }

    // Media validation errors - don't retry
    if (errorLower.includes('invalid media') ||
        errorLower.includes('file size') ||
        errorLower.includes('format') ||
        errorLower.includes('duration')) {
        return {
            category: 'validation',
            shouldRetry: false,
            reason: 'Validation errors require user to fix the media',
        };
    }

    // Unknown errors - retry cautiously
    return {
        category: 'unknown',
        shouldRetry: true,
        reason: 'Unknown errors may be transient',
    };
}

/**
 * Retry handler class for managing retry state
 */
export class RetryHandler {
    private attempts: Map<number, RetryAttempt[]> = new Map();
    private config: RetryConfig;

    constructor(config: Partial<RetryConfig> = {}) {
        this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
    }

    /**
     * Record a retry attempt
     */
    recordAttempt(postId: number, attempt: RetryAttempt) {
        const attempts = this.attempts.get(postId) || [];
        attempts.push(attempt);
        this.attempts.set(postId, attempts);

        logger.debug(
            `Retry: Post ${postId} attempt ${attempt.attempt} - ` +
            `${attempt.success ? 'SUCCESS' : `FAILED (${attempt.error})`}`
        );
    }

    /**
     * Get retry history for a post
     */
    getHistory(postId: number): RetryAttempt[] {
        return this.attempts.get(postId) || [];
    }

    /**
     * Check if post can be retried
     */
    canRetry(postId: number, error: string): {
        canRetry: boolean;
        reason: string;
        nextRetryAt?: Date;
    } {
        const attempts = this.getHistory(postId);
        const attemptCount = attempts.length;

        // Check max retries
        if (!shouldRetry(attemptCount, this.config.maxRetries)) {
            return {
                canRetry: false,
                reason: `Max retries (${this.config.maxRetries}) exceeded`,
            };
        }

        // Check error category
        const errorInfo = categorizeError(error);
        if (!errorInfo.shouldRetry) {
            return {
                canRetry: false,
                reason: `${errorInfo.category}: ${errorInfo.reason}`,
            };
        }

        // Calculate next retry time
        const nextRetryAt = getNextRetryTime(attemptCount, this.config);

        return {
            canRetry: true,
            reason: `Will retry (attempt ${attemptCount + 1}/${this.config.maxRetries})`,
            nextRetryAt,
        };
    }

    /**
     * Clear retry history for a post
     */
    clear(postId: number) {
        this.attempts.delete(postId);
    }

    /**
     * Get retry statistics
     */
    getStats() {
        const totalPosts = this.attempts.size;
        let totalAttempts = 0;
        let successfulRetries = 0;
        let failedPosts = 0;

        for (const [postId, attempts] of this.attempts.entries()) {
            totalAttempts += attempts.length;

            const lastAttempt = attempts[attempts.length - 1];
            if (lastAttempt.success) {
                if (attempts.length > 1) {
                    successfulRetries++;
                }
            } else {
                failedPosts++;
            }
        }

        return {
            totalPosts,
            totalAttempts,
            successfulRetries,
            failedPosts,
            averageAttemptsPerPost: totalPosts > 0 ? (totalAttempts / totalPosts).toFixed(2) : 0,
        };
    }
}

// Export singleton instance
export const retryHandler = new RetryHandler();

// Export strategy for reference
export const RETRY_STRATEGY = getRetryStrategy();

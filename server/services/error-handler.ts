/**
 * Snapchat Scheduler Error Handler
 * 
 * Centralized error handling and logging for the scheduler system.
 * Includes error categorization, notification, and recovery strategies.
 */

import { logger } from "../logger";

/**
 * Error severity levels
 */
export enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical",
}

/**
 * Error categories
 */
export enum ErrorCategory {
    NETWORK = "network",
    AUTH = "auth",
    VALIDATION = "validation",
    RATE_LIMIT = "rate_limit",
    STORAGE = "storage",
    DATABASE = "database",
    SNAPCHAT_API = "snapchat_api",
    UNKNOWN = "unknown",
}

/**
 * Scheduler error class
 */
export class SchedulerError extends Error {
    public category: ErrorCategory;
    public severity: ErrorSeverity;
    public context?: any;
    public recoverable: boolean;

    constructor(
        message: string,
        category: ErrorCategory = ErrorCategory.UNKNOWN,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        context?: any,
        recoverable: boolean = true
    ) {
        super(message);
        this.name = "SchedulerError";
        this.category = category;
        this.severity = severity;
        this.context = context;
        this.recoverable = recoverable;

        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Categorize and enhance errors
 */
export function categorizeError(error: any): SchedulerError {
    const message = error.message || "Unknown error";

    // Network errors
    if (
        message.includes("ECONNREFUSED") ||
        message.includes("ETIMEDOUT") ||
        message.includes("ENOTFOUND") ||
        message.includes("network")
    ) {
        return new SchedulerError(
            message,
            ErrorCategory.NETWORK,
            ErrorSeverity.MEDIUM,
            error,
            true
        );
    }

    // Authentication errors
    if (
        message.includes("unauthorized") ||
        message.includes("invalid token") ||
        message.includes("expired token") ||
        message.includes("401")
    ) {
        return new SchedulerError(
            message,
            ErrorCategory.AUTH,
            ErrorSeverity.HIGH,
            error,
            false
        );
    }

    // Rate limiting
    if (
        message.includes("rate limit") ||
        message.includes("too many requests") ||
        message.includes("429")
    ) {
        return new SchedulerError(
            message,
            ErrorCategory.RATE_LIMIT,
            ErrorSeverity.MEDIUM,
            error,
            true
        );
    }

    // Validation errors
    if (
        message.includes("validation") ||
        message.includes("invalid") ||
        message.includes("required")
    ) {
        return new SchedulerError(
            message,
            ErrorCategory.VALIDATION,
            ErrorSeverity.LOW,
            error,
            false
        );
    }

    // Storage errors
    if (
        message.includes("ENOENT") ||
        message.includes("storage") ||
        message.includes("file")
    ) {
        return new SchedulerError(
            message,
            ErrorCategory.STORAGE,
            ErrorSeverity.MEDIUM,
            error,
            true
        );
    }

    // Database errors
    if (
        message.includes("database") ||
        message.includes("query") ||
        message.includes("postgres")
    ) {
        return new SchedulerError(
            message,
            ErrorCategory.DATABASE,
            ErrorSeverity.HIGH,
            error,
            true
        );
    }

    // Snapchat API errors
    if (message.includes("snapchat") || message.includes("api")) {
        return new SchedulerError(
            message,
            ErrorCategory.SNAPCHAT_API,
            ErrorSeverity.MEDIUM,
            error,
            true
        );
    }

    // Unknown errors
    return new SchedulerError(
        message,
        ErrorCategory.UNKNOWN,
        ErrorSeverity.MEDIUM,
        error,
        true
    );
}

/**
 * Log error with context
 */
export function logError(error: SchedulerError, additionalContext?: any) {
    const logContext = {
        category: error.category,
        severity: error.severity,
        recoverable: error.recoverable,
        ...error.context,
        ...additionalContext,
    };

    switch (error.severity) {
        case ErrorSeverity.CRITICAL:
            logger.error(`[CRITICAL] ${error.message}`, logContext);
            break;
        case ErrorSeverity.HIGH:
            logger.error(`[HIGH] ${error.message}`, logContext);
            break;
        case ErrorSeverity.MEDIUM:
            logger.warn(`[MEDIUM] ${error.message}`, logContext);
            break;
        case ErrorSeverity.LOW:
            logger.info(`[LOW] ${error.message}`, logContext);
            break;
    }
}

/**
 * Handle error with appropriate action
 */
export async function handleError(
    error: any,
    context?: any
): Promise<{
    handled: boolean;
    retry: boolean;
    notifyUser: boolean;
}> {
    const schedulerError = categorizeError(error);

    // Log the error
    logError(schedulerError, context);

    // Determine actions based on severity and category
    let retry = schedulerError.recoverable;
    let notifyUser = false;

    if (schedulerError.severity === ErrorSeverity.CRITICAL) {
        notifyUser = true;
        // TODO: Send critical error notification
    } else if (schedulerError.severity === ErrorSeverity.HIGH) {
        if (schedulerError.category === ErrorCategory.AUTH) {
            notifyUser = true;
            retry = false;
        }
    }

    return {
        handled: true,
        retry,
        notifyUser,
    };
}

/**
 * Error notification service (placeholder)
 */
export async function notifyError(
    error: SchedulerError,
    userId: number,
    postId?: number
): Promise<void> {
    logger.info(`Notifying user ${userId} about error: ${error.message}`);

    // TODO: Implement notification (email, push, etc.)
    // Could integrate with existing notification system
}

/**
 * Get error recovery suggestions
 */
export function getRecoverySuggestions(error: SchedulerError): string[] {
    const suggestions: string[] = [];

    switch (error.category) {
        case ErrorCategory.AUTH:
            suggestions.push("Reconnect your Snapchat account");
            suggestions.push("Check if your Snapchat access token has expired");
            break;

        case ErrorCategory.NETWORK:
            suggestions.push("Check your internet connection");
            suggestions.push("The post will be retried automatically");
            break;

        case ErrorCategory.RATE_LIMIT:
            suggestions.push("Snapchat API rate limit reached");
            suggestions.push("Posts will be published when rate limit resets");
            break;

        case ErrorCategory.VALIDATION:
            suggestions.push("Check media file format and size");
            suggestions.push("Ensure caption is under 250 characters");
            break;

        case ErrorCategory.STORAGE:
            suggestions.push("Check storage quota");
            suggestions.push("Ensure media files are accessible");
            break;

        default:
            suggestions.push("Please try again later");
            suggestions.push("Contact support if the issue persists");
    }

    return suggestions;
}

/**
 * Error statistics tracking
 */
class ErrorTracker {
    private errors: Map<string, number> = new Map();
    private lastReset = Date.now();

    track(category: ErrorCategory) {
        const count = this.errors.get(category) || 0;
        this.errors.set(category, count + 1);
    }

    getStats() {
        return {
            errors: Object.fromEntries(this.errors),
            period: Date.now() - this.lastReset,
        };
    }

    reset() {
        this.errors.clear();
        this.lastReset = Date.now();
    }
}

export const errorTracker = new ErrorTracker();

// Reset error stats every hour
setInterval(() => {
    const stats = errorTracker.getStats();
    logger.info("Hourly error stats:", stats);
    errorTracker.reset();
}, 60 * 60 * 1000);

export const ErrorHandler = {
    categorizeError,
    logError,
    handleError,
    notifyError,
    getRecoverySuggestions,
};

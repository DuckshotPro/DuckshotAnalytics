/**
 * Rate Limiting Middleware
 * 
 * Provides rate limiting for various endpoints to prevent abuse.
 * Configured limits:
 * - Registration: 5 accounts per hour per IP
 * - Email verification: 10 attempts per hour per IP
 * - Resend verification: 3 requests per hour per user
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for user registration
 * Limits: 5 registrations per hour per IP
 */
export const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour
    message: 'Too many accounts created from this IP. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for email verification attempts
 * Limits: 10 verification attempts per hour per IP
 */
export const verificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 attempts per hour
    message: 'Too many verification attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for resending verification emails
 * Limits: 3 resend requests per hour per IP
 */
export const resendLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per hour
    message: 'Too many verification emails requested. Please check your spam folder or try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

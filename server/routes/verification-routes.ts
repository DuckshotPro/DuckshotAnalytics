/**
 * Email Verification Routes (Enterprise Security)
 * 
 * Handles email verification endpoints with enterprise-grade security:
 * - Hashed tokens (stored like passwords)
 * - Rate limiting to prevent abuse
 * - POST-based verification (no tokens in URLs)
 * - One-time token usage
 */

import { Router } from 'express';
import { db } from '../db';
import { users, verificationTokens } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import crypto from 'crypto';
import { sendVerificationEmail } from '../services/email-service';
import { hashToken, compareToken } from '../utils/token-hash';
import { verificationLimiter, resendLimiter } from '../middleware/rate-limit';

const router = Router();

/**
 * Generate a secure random verification token
 */
function generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * POST /api/auth/resend-verification
 * Resend verification email to the authenticated user
 * Rate limited: 3 requests per hour
 */
router.post('/resend-verification', resendLimiter, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = (req.user as any).id;

    try {
        // Check if user is already verified
        const [user] = await db.select().from(users).where(eq(users.id, userId));

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        if (!user.email) {
            return res.status(400).json({ message: 'No email address on file' });
        }

        // Delete any existing verification tokens for this user
        await db.delete(verificationTokens).where(eq(verificationTokens.userId, userId));

        // Generate new verification token
        const plainToken = generateVerificationToken();
        const hashedToken = await hashToken(plainToken);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store hashed token in database
        await db.insert(verificationTokens).values({
            userId,
            token: hashedToken,
            expiresAt,
        });

        // Send verification email with plain token (not exposed in URL)
        await sendVerificationEmail({
            to: user.email,
            username: user.username,
            verificationToken: plainToken,
        });

        res.json({ message: 'Verification email sent' });
    } catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).json({ message: 'Failed to resend verification email' });
    }
});

/**
 * POST /api/auth/verify-email
 * Verify email address using the provided token (from POST body)
 * Rate limited: 10 attempts per hour per IP
 */
router.post('/verify-email', verificationLimiter, async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            message: 'Verification token is required',
            success: false
        });
    }

    try {
        // Get all non-expired tokens
        const tokens = await db
            .select()
            .from(verificationTokens)
            .where(gt(verificationTokens.expiresAt, new Date()));

        // Find matching token by comparing hashes
        let matchedToken = null;
        for (const tokenRecord of tokens) {
            const isMatch = await compareToken(token, tokenRecord.token);
            if (isMatch) {
                matchedToken = tokenRecord;
                break;
            }
        }

        if (!matchedToken) {
            return res.status(400).json({
                message: 'Invalid or expired verification link',
                expired: true,
                success: false
            });
        }

        // Update user's email verification status
        await db
            .update(users)
            .set({
                emailVerified: true,
                emailVerifiedAt: new Date(),
            })
            .where(eq(users.id, matchedToken.userId));

        // Delete the used token
        await db.delete(verificationTokens).where(eq(verificationTokens.id, matchedToken.id));

        res.json({
            message: 'Email verified successfully',
            success: true
        });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({
            message: 'Failed to verify email',
            success: false
        });
    }
});

export default router;

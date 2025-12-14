/**
 * Token Hashing Utilities
 * 
 * Provides secure token hashing for email verification tokens.
 * Tokens are hashed before storage (like passwords) to prevent exposure if database is compromised.
 */

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a verification token before storing in database
 * @param token - Plain text token to hash
 * @returns Hashed token
 */
export async function hashToken(token: string): Promise<string> {
    try {
        const hash = await bcrypt.hash(token, SALT_ROUNDS);
        return hash;
    } catch (error) {
        console.error('Error hashing token:', error);
        throw new Error('Failed to hash token');
    }
}

/**
 * Compare a plain token with a hashed token
 * @param plainToken - Plain text token from user
 * @param hashedToken - Hashed token from database
 * @returns True if tokens match, false otherwise
 */
export async function compareToken(plainToken: string, hashedToken: string): Promise<boolean> {
    try {
        const isMatch = await bcrypt.compare(plainToken, hashedToken);
        return isMatch;
    } catch (error) {
        console.error('Error comparing tokens:', error);
        return false;
    }
}

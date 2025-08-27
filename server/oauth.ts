/**
 * OAuth Integration for Snapchat Authentication
 * 
 * This file implements OAuth authentication strategies for Snapchat,
 * allowing users to authenticate with their Snapchat accounts and
 * automatically grant access to analytics data.
 */

import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import { Express } from "express";
import { providers, strategyConfig } from "./oauth-config";
import { storage } from "./storage";
import { users, oauthTokens } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { db } from "./db";

/**
 * Setup OAuth Authentication Strategies
 * 
 * Configures Passport.js with OAuth strategies for supported providers
 * and sets up the necessary authentication routes.
 * 
 * @param app - The Express application instance
 */
export function setupOAuth(app: Express) {
  // Check if required environment variables are set
  console.log("OAuth Setup - Checking environment variables:");
  console.log("SNAPCHAT_CLIENT_ID:", process.env.SNAPCHAT_CLIENT_ID ? "SET" : "NOT SET");
  console.log("SNAPCHAT_CLIENT_SECRET:", process.env.SNAPCHAT_CLIENT_SECRET ? "SET" : "NOT SET");
  console.log("providers.snapchat.clientID:", providers.snapchat.clientID ? "SET" : "NOT SET");
  console.log("providers.snapchat.clientSecret:", providers.snapchat.clientSecret ? "SET" : "NOT SET");
  
  if (!providers.snapchat.clientID || !providers.snapchat.clientSecret) {
    console.warn("Snapchat OAuth is not configured. Set SNAPCHAT_CLIENT_ID and SNAPCHAT_CLIENT_SECRET environment variables.");
    return;
  }
  
  console.log("✅ OAuth configuration successful - registering routes");

  /**
   * Snapchat OAuth Strategy
   * 
   * Handles authentication with Snapchat and processing of OAuth tokens.
   */
  // Use a custom OAuth2 strategy for Snapchat
  passport.use('snapchat', new OAuth2Strategy({
    authorizationURL: 'https://accounts.snapchat.com/accounts/oauth2/auth',
    tokenURL: 'https://accounts.snapchat.com/accounts/oauth2/token',
    clientID: providers.snapchat.clientID,
    clientSecret: providers.snapchat.clientSecret,
    callbackURL: providers.snapchat.callbackURL,
    scope: providers.snapchat.scope.join(' '),
    passReqToCallback: true,
    // We don't fetch profile from Snapchat in this prototype, so skip it
    skipUserProfile: true,
  }, async (req: any, accessToken: string, refreshToken: string, params: any, profile: any, done: any) => {
    // In a real application, we would make an API call to get the user profile
    // For now, we'll create a mock profile using the token data
    const profile = {
      id: `snap_${Date.now()}`, // In a real app, this should be the Snapchat user ID
      displayName: 'Snapchat User',
      provider: 'snapchat'
    };
    try {
      // Check if this is an existing user authenticating with OAuth
      const snapchatId = profile.id;
      
      // If user is logged in, link their account to Snapchat
      if (req.isAuthenticated() && req.user) {
        const userId = req.user.id;
        
        // Store OAuth tokens
        await saveOAuthTokens(userId, {
          provider: "snapchat",
          providerUserId: snapchatId,
          accessToken,
          refreshToken,
          scope: providers.snapchat.scope.join(" "),
          expiresAt: calculateTokenExpiry()
        });
        
        // Update user record with Snapchat credentials
        await storage.updateUserSnapchatCredentials(
          userId, 
          providers.snapchat.clientID, 
          accessToken
        );
        
        // Return the updated user
        const user = await storage.getUser(userId);
        return done(null, user);
      }
      
      // Check if there's an existing user with this Snapchat ID
      const existingUser = await findUserBySnapchatId(snapchatId);
      
      if (existingUser) {
        // Update OAuth tokens for existing user
        await saveOAuthTokens(existingUser.id, {
          provider: "snapchat",
          providerUserId: snapchatId,
          accessToken,
          refreshToken,
          scope: providers.snapchat.scope.join(" "),
          expiresAt: calculateTokenExpiry()
        });
        
        return done(null, existingUser);
      } else {
        // Create a new user with Snapchat profile
        const username = `snapchat_${profile.id}`;
        const password = generateSecurePassword(); // Generate a random secure password
        
        const newUser = await storage.createUser({
          username,
          password,
        });
        
        // Store OAuth tokens for the new user
        await saveOAuthTokens(newUser.id, {
          provider: "snapchat",
          providerUserId: snapchatId,
          accessToken,
          refreshToken,
          scope: providers.snapchat.scope.join(" "),
          expiresAt: calculateTokenExpiry()
        });
        
        // Update user with Snapchat credentials
        await storage.updateUserSnapchatCredentials(
          newUser.id, 
          providers.snapchat.clientID, 
          accessToken
        );
        
        return done(null, newUser);
      }
    } catch (error) {
      return done(error as Error);
    }
  }));

  /**
   * OAuth Routes
   * 
   * Sets up routes for initiating authentication and handling callbacks.
   */
  
  // Route to initiate Snapchat authentication
  app.get("/api/auth/snapchat", passport.authenticate("snapchat"));
  
  // OAuth callback route
  app.get("/api/auth/snapchat/callback", 
    passport.authenticate("snapchat", { failureRedirect: "/auth?error=oauth_failed" }),
    (req, res) => {
      // Successful authentication, redirect to dashboard
      res.redirect("/dashboard?connected=true");
    }
  );
  
  // Route to connect an existing account to Snapchat
  app.get("/api/connect/snapchat",
    ensureAuthenticated,
    passport.authenticate("snapchat", { 
      scope: providers.snapchat.scope 
    })
  );
}

/**
 * Middleware to ensure user is authenticated
 */
function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth");
}

/**
 * Find a user by their Snapchat ID
 * 
 * Queries the database for a user with the specified Snapchat ID.
 */
async function findUserBySnapchatId(snapchatId: string) {
  const [token] = await db.select({
    userId: oauthTokens.userId
  })
  .from(oauthTokens)
  .where(eq(oauthTokens.providerUserId, snapchatId))
  .limit(1);
  
  if (!token) return undefined;
  
  return await storage.getUser(token.userId);
}

/**
 * Save OAuth tokens for a user
 * 
 * Stores or updates OAuth tokens in the database.
 */
async function saveOAuthTokens(userId: number, tokenData: {
  provider: string;
  providerUserId: string;
  accessToken: string;
  refreshToken?: string;
  scope: string;
  expiresAt: Date;
}) {
  // Check for existing token record
  const [existingToken] = await db.select()
    .from(oauthTokens)
    .where(
      and(
        eq(oauthTokens.userId, userId),
        eq(oauthTokens.provider, tokenData.provider)
      )
    );
  
  if (existingToken) {
    // Update existing token
    await db.update(oauthTokens)
      .set({
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken || null,
        scope: tokenData.scope,
        expiresAt: tokenData.expiresAt,
        updatedAt: new Date()
      })
      .where(eq(oauthTokens.id, existingToken.id));
  } else {
    // Create new token record
    await db.insert(oauthTokens).values({
      userId,
      provider: tokenData.provider,
      providerUserId: tokenData.providerUserId,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken || null,
      scope: tokenData.scope,
      expiresAt: tokenData.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}

/**
 * Calculate token expiry date
 * 
 * Returns a date object for when the token will expire.
 * Default is 60 days from current time.
 */
function calculateTokenExpiry(expiresIn: number = 60 * 24 * 60 * 60) {
  const now = new Date();
  return new Date(now.getTime() + expiresIn * 1000);
}

/**
 * Generate a secure random password
 * 
 * Creates a cryptographically secure random password for OAuth users.
 */
function generateSecurePassword(length: number = 24): string {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}
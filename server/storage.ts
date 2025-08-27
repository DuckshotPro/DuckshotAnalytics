/**
 * Data Access Layer
 * 
 * This file provides a storage interface and implementation for the application.
 * It handles all database operations and maintains persistence of user sessions.
 */

import { 
  users, 
  User, 
  InsertUser, 
  snapchatData, 
  SnapchatData,
  aiInsights,
  AiInsight,
  oauthTokens,
  OAuthToken,
  InsertOAuthToken,
  consentLogs,
  ConsentLog,
  jobExecutionLogs,
  JobExecutionLog,
  InsertJobExecutionLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

/**
 * Storage Interface
 * 
 * Defines the contract for data storage operations in the application.
 * Any storage implementation must provide these methods.
 */
export interface IStorage {
  /**
   * Retrieves a user by their ID
   * @param id - The user's unique ID
   * @returns The user object or undefined if not found
   */
  getUser(id: number): Promise<User | undefined>;
  
  /**
   * Retrieves a user by their username
   * @param username - The user's unique username
   * @returns The user object or undefined if not found
   */
  getUserByUsername(username: string): Promise<User | undefined>;
  
  /**
   * Creates a new user in the database
   * @param user - User data for creation
   * @returns The newly created user object
   */
  createUser(user: InsertUser): Promise<User>;
  
  /**
   * Updates a user's Snapchat API credentials
   * @param userId - The user's ID
   * @param clientId - Snapchat client ID
   * @param apiKey - Snapchat API key
   * @returns The updated user object
   */
  updateUserSnapchatCredentials(userId: number, clientId: string, apiKey: string, consentData?: {
    dataConsent: boolean;
    consentDate: Date | null;
    privacyPolicyVersion: string | null;
  }): Promise<User>;
  
  /**
   * Updates a user's subscription status
   * @param userId - The user's ID
   * @param subscription - The subscription tier ("free" or "premium")
   * @param expiresAt - When the subscription expires (null for free tier)
   * @returns The updated user object
   */
  updateUserSubscription(userId: number, subscription: string, expiresAt: Date | null): Promise<User>;

  /**
   * Retrieves all users (for batch processing)
   * @returns Array of all user objects
   */
  getAllUsers(): Promise<User[]>;

  /**
   * Logs job execution for monitoring and debugging
   * @param jobData - Job execution data
   */
  logJobExecution(jobData: Partial<InsertJobExecutionLog>): Promise<void>;

  /**
   * Cleans up old data based on retention policy
   * @param userId - The user's ID
   * @param cutoffDate - Date before which to delete data
   * @returns Number of records cleaned
   */
  cleanupOldData(userId: number, cutoffDate: Date): Promise<number>;

  /**
   * Gets the latest Snapchat data for a user
   * @param userId - The user's ID
   * @returns Latest Snapchat data record
   */
  getSnapchatData(userId: number): Promise<SnapchatData | undefined>;
  /**
   * Compatibility helper matching existing route usage.
   * Returns the most recent Snapchat data for a user.
   */
  getLatestSnapchatData(userId: number): Promise<SnapchatData | undefined>;
  
  /**
   * Saves Snapchat data for a user
   * @param userId - The user's ID
   * @param data - Snapchat data to save
   * @returns The saved data record
   */
  saveSnapchatData(userId: number, data: any): Promise<SnapchatData>;
  
  /**
   * Saves an AI-generated insight for a user
   * @param userId - The user's ID
   * @param insight - The insight text
   * @returns The saved insight record
   */
  saveAiInsight(userId: number, insight: string): Promise<AiInsight>;
  
  /**
   * Gets the most recent AI insight for a user
   * @param userId - The user's ID
   * @returns The latest insight or undefined if none exists
   */
  getLatestAiInsight(userId: number): Promise<AiInsight | undefined>;
  
  /**
   * Gets OAuth tokens for a user by provider
   * @param userId - The user's ID
   * @param provider - The OAuth provider name (e.g., "snapchat")
   * @returns The OAuth token or undefined if not found
   */
  getOAuthToken(userId: number, provider: string): Promise<OAuthToken | undefined>;
  
  /**
   * Gets a user by their provider ID
   * @param provider - The OAuth provider name
   * @param providerUserId - The user ID from the provider
   * @returns The user ID or undefined if not found
   */
  getUserByProviderId(provider: string, providerUserId: string): Promise<number | undefined>;
  
  /**
   * Saves or updates OAuth tokens for a user
   * @param tokenData - The OAuth token data to save
   * @returns The saved token record
   */
  saveOAuthToken(tokenData: InsertOAuthToken): Promise<OAuthToken>;
  
  /**
   * Updates user profile data from OAuth
   * @param userId - The user's ID
   * @param displayName - The user's display name
   * @param profilePictureUrl - URL to the user's profile picture
   * @returns The updated user
   */
  updateUserProfile(userId: number, displayName?: string, profilePictureUrl?: string): Promise<User>;
  
  /**
   * Updates a user's data privacy preferences
   * @param userId - The user's ID
   * @param preferences - The data privacy preferences to update
   * @returns The updated user
   */
  updateUserDataPreferences(userId: number, preferences: {
    allowAnalytics?: boolean;
    allowDemographics?: boolean;
    allowLocationData?: boolean;
    allowContentAnalysis?: boolean;
    allowThirdPartySharing?: boolean;
    allowMarketing?: boolean;
  }): Promise<User>;
  
  /**
   * Updates a user's consent status
   * @param userId - The user's ID
   * @param dataConsent - Whether the user consents to data collection
   * @param consentDate - When the consent was given
   * @param privacyPolicyVersion - The version of the privacy policy accepted
   * @returns The updated user
   */
  updateUserConsent(userId: number, dataConsent: boolean, consentDate: Date, privacyPolicyVersion: string): Promise<User>;
  
  /**
   * Session store for persistence
   * Used by express-session to store user sessions
   */
  sessionStore: any; // Using any for session store type
}

/**
 * PostgreSQL Database Storage Implementation
 * 
 * Implements the IStorage interface using PostgreSQL with Drizzle ORM.
 * Provides persistent storage for the application's data.
 */
export class DatabaseStorage implements IStorage {
  sessionStore: any; // Type for session store

  /**
   * Initializes the DatabaseStorage class
   * Sets up the PostgreSQL session store
   */
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true // Creates session table if it doesn't exist
    });
  }

  /**
   * Retrieves a user by their ID
   * @param id - The user's unique ID
   * @returns The user object or undefined if not found
   */
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  /**
   * Retrieves a user by their username
   * @param username - The user's unique username
   * @returns The user object or undefined if not found
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  /**
   * Creates a new user in the database
   * @param insertUser - User data for creation (username, password)
   * @returns The newly created user object
   */
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      snapchatClientId: null,
      snapchatApiKey: null,
      subscription: "free", // Default to free tier
      subscriptionExpiresAt: null,
    }).returning();
    
    return user;
  }

  /**
   * Updates a user's Snapchat API credentials
   * @param userId - The user's ID
   * @param clientId - Snapchat client ID
   * @param apiKey - Snapchat API key
   * @param consentData - Optional consent data including dataConsent flag, date, and privacy policy version
   * @returns The updated user object
   * @throws Error if user not found
   */
  async updateUserSnapchatCredentials(
    userId: number, 
    clientId: string, 
    apiKey: string, 
    consentData?: {
      dataConsent?: boolean;
      consentDate?: string;
      privacyPolicyVersion?: string;
    }
  ): Promise<User> {
    const updateData: any = {
      snapchatClientId: clientId,
      snapchatApiKey: apiKey
    };
    
    // Add consent data if provided
    if (consentData) {
      if (consentData.dataConsent !== undefined) {
        updateData.dataConsent = consentData.dataConsent;
      }
      if (consentData.consentDate) {
        updateData.consentDate = consentData.consentDate;
      }
      if (consentData.privacyPolicyVersion) {
        updateData.privacyPolicyVersion = consentData.privacyPolicyVersion;
      }
    }
    
    const [user] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  /**
   * Updates a user's subscription status
   * @param userId - The user's ID
   * @param subscription - The subscription tier ("free" or "premium")
   * @param expiresAt - When the subscription expires (null for free tier)
   * @returns The updated user object
   * @throws Error if user not found
   */
  async updateUserSubscription(userId: number, subscription: string, expiresAt: Date | null): Promise<User> {
    const [user] = await db.update(users)
      .set({
        subscription,
        subscriptionExpiresAt: expiresAt
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  /**
   * Saves Snapchat data for a user
   * @param userId - The user's ID
   * @param data - Snapchat data to save (JSON object)
   * @returns The saved data record
   */
  async saveSnapchatData(userId: number, data: any): Promise<SnapchatData> {
    const now = new Date();
    const [snapchatDataEntry] = await db.insert(snapchatData)
      .values({
        userId,
        data,
        fetchedAt: now
      })
      .returning();
    
    return snapchatDataEntry;
  }

  /**
   * Gets the most recent Snapchat data for a user
   * @param userId - The user's ID
   * @returns The latest Snapchat data or undefined if none exists
   */
  async getSnapchatData(userId: number): Promise<SnapchatData | undefined> {
    const [latestData] = await db.select()
      .from(snapchatData)
      .where(eq(snapchatData.userId, userId))
      .orderBy(desc(snapchatData.fetchedAt)) // Most recent first
      .limit(1);
    
    return latestData;
  }

  /**
   * Alias to support existing callers using getLatestSnapchatData.
   * Keeps behavior identical to getSnapchatData which already returns latest.
   */
  async getLatestSnapchatData(userId: number): Promise<SnapchatData | undefined> {
    return this.getSnapchatData(userId);
  }

  /**
   * Saves an AI-generated insight for a user
   * @param userId - The user's ID
   * @param insight - The insight text
   * @returns The saved insight record
   */
  async saveAiInsight(userId: number, insight: string): Promise<AiInsight> {
    const now = new Date();
    const [aiInsightEntry] = await db.insert(aiInsights)
      .values({
        userId,
        insight,
        createdAt: now
      })
      .returning();
    
    return aiInsightEntry;
  }

  /**
   * Gets the most recent AI insight for a user
   * @param userId - The user's ID
   * @returns The latest insight or undefined if none exists
   */
  async getLatestAiInsight(userId: number): Promise<AiInsight | undefined> {
    const [latestInsight] = await db.select()
      .from(aiInsights)
      .where(eq(aiInsights.userId, userId))
      .orderBy(desc(aiInsights.createdAt)) // Most recent first
      .limit(1);
    
    return latestInsight;
  }

  /**
   * Gets OAuth tokens for a user by provider
   * @param userId - The user's ID
   * @param provider - The OAuth provider name (e.g., "snapchat")
   * @returns The OAuth token or undefined if not found
   */
  async getOAuthToken(userId: number, provider: string): Promise<OAuthToken | undefined> {
    const [token] = await db.select()
      .from(oauthTokens)
      .where(
        and(
          eq(oauthTokens.userId, userId),
          eq(oauthTokens.provider, provider)
        )
      );
    
    return token;
  }
  
  /**
   * Gets all users (for batch processing)
   * @returns Array of all user objects
   */
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  /**
   * Logs job execution for monitoring and debugging
   * @param jobData - Job execution data
   */
  async logJobExecution(jobData: Partial<InsertJobExecutionLog>): Promise<void> {
    await db.insert(jobExecutionLogs).values({
      userId: jobData.userId || null,
      jobType: jobData.jobType!,
      status: jobData.status!,
      executedAt: jobData.executedAt || new Date(),
      completedAt: jobData.completedAt || null,
      error: jobData.error || null,
      metadata: jobData.metadata || null,
      duration: jobData.duration || null,
    });
  }

  /**
   * Cleans up old data based on retention policy
   * @param userId - The user's ID
   * @param cutoffDate - Date before which to delete data
   * @returns Number of records cleaned
   */
  async cleanupOldData(userId: number, cutoffDate: Date): Promise<number> {
    // Clean up old Snapchat data
    const deletedSnapchatData = await db.delete(snapchatData)
      .where(
        and(
          eq(snapchatData.userId, userId),
          // Use SQL comparison for date
          db.sql`${snapchatData.fetchedAt} < ${cutoffDate}`
        )
      );

    // Clean up old AI insights
    const deletedInsights = await db.delete(aiInsights)
      .where(
        and(
          eq(aiInsights.userId, userId),
          db.sql`${aiInsights.createdAt} < ${cutoffDate}`
        )
      );

    return (deletedSnapchatData as any).rowCount + (deletedInsights as any).rowCount || 0;
  }

  /**
   * Gets a user by their provider ID
   * @param provider - The OAuth provider name
   * @param providerUserId - The user ID from the provider
   * @returns The user ID or undefined if not found
   */
  async getUserByProviderId(provider: string, providerUserId: string): Promise<number | undefined> {
    const [token] = await db.select({
      userId: oauthTokens.userId
    })
    .from(oauthTokens)
    .where(
      and(
        eq(oauthTokens.provider, provider),
        eq(oauthTokens.providerUserId, providerUserId)
      )
    )
    .limit(1);
    
    return token?.userId;
  }
  
  /**
   * Saves or updates OAuth tokens for a user
   * @param tokenData - The OAuth token data to save
   * @returns The saved token record
   */
  async saveOAuthToken(tokenData: InsertOAuthToken): Promise<OAuthToken> {
    // Check for existing token
    const existingToken = await this.getOAuthToken(tokenData.userId, tokenData.provider as string);
    
    if (existingToken) {
      // Update existing token
      const [updatedToken] = await db.update(oauthTokens)
        .set({
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          scope: tokenData.scope,
          expiresAt: tokenData.expiresAt,
          updatedAt: new Date()
        })
        .where(eq(oauthTokens.id, existingToken.id))
        .returning();
      
      return updatedToken;
    } else {
      // Create new token
      const now = new Date();
      const [newToken] = await db.insert(oauthTokens)
        .values({
          ...tokenData,
          createdAt: now,
          updatedAt: now
        })
        .returning();
      
      return newToken;
    }
  }
  
  /**
   * Updates user profile data from OAuth
   * @param userId - The user's ID
   * @param displayName - The user's display name
   * @param profilePictureUrl - URL to the user's profile picture
   * @returns The updated user
   */
  async updateUserProfile(userId: number, displayName?: string, profilePictureUrl?: string): Promise<User> {
    const updateData: any = {};
    
    if (displayName !== undefined) {
      updateData.displayName = displayName;
    }
    
    if (profilePictureUrl !== undefined) {
      updateData.profilePictureUrl = profilePictureUrl;
    }
    
    // Only update if we have changes
    if (Object.keys(updateData).length === 0) {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    }
    
    const [user] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  /**
   * Updates a user's data privacy preferences
   * @param userId - The user's ID
   * @param preferences - The data privacy preferences to update
   * @returns The updated user
   */
  async updateUserDataPreferences(userId: number, preferences: {
    allowAnalytics?: boolean;
    allowDemographics?: boolean;
    allowLocationData?: boolean;
    allowContentAnalysis?: boolean;
    allowThirdPartySharing?: boolean;
    allowMarketing?: boolean;
  }): Promise<User> {
    const updateData: any = {};
    
    if (preferences.allowAnalytics !== undefined) {
      updateData.allowAnalytics = preferences.allowAnalytics;
    }
    
    if (preferences.allowDemographics !== undefined) {
      updateData.allowDemographics = preferences.allowDemographics;
    }
    
    if (preferences.allowLocationData !== undefined) {
      updateData.allowLocationData = preferences.allowLocationData;
    }
    
    if (preferences.allowContentAnalysis !== undefined) {
      updateData.allowContentAnalysis = preferences.allowContentAnalysis;
    }
    
    if (preferences.allowThirdPartySharing !== undefined) {
      updateData.allowThirdPartySharing = preferences.allowThirdPartySharing;
    }
    
    if (preferences.allowMarketing !== undefined) {
      updateData.allowMarketing = preferences.allowMarketing;
    }
    
    updateData.updatedAt = new Date();
    
    const [user] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }
  
  /**
   * Updates a user's consent status
   * @param userId - The user's ID
   * @param dataConsent - Whether the user consents to data collection
   * @param consentDate - When the consent was given
   * @param privacyPolicyVersion - The version of the privacy policy accepted
   * @returns The updated user
   */
  async updateUserConsent(userId: number, dataConsent: boolean, consentDate: Date, privacyPolicyVersion: string): Promise<User> {
    const [user] = await db.update(users)
      .set({
        dataConsent,
        consentDate,
        privacyPolicyVersion,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }
}

// Import the pool from db.ts
import { pool } from "./db";

/**
 * Application Storage Instance
 * 
 * This is the single instance of storage that will be used throughout the application.
 * It uses the DatabaseStorage implementation for persistent storage.
 */
export const storage = new DatabaseStorage();

/**
 * Log a user consent action for GDPR compliance
 * @param userId - The user's ID
 * @param action - The consent action ("granted", "withdrawn", "updated")
 * @param detail - Optional details about the consent action
 * @param privacyPolicyVersion - The version of the privacy policy
 * @param request - Express request object to capture IP and user agent (optional)
 * @returns The logged consent entry
 */
export async function logConsent(
  userId: number, 
  action: string, 
  detail?: string,
  privacyPolicyVersion?: string,
  request?: any // Express request
): Promise<ConsentLog> {
  const data: any = {
    userId,
    action,
    createdAt: new Date()
  };
  
  if (detail) data.detail = detail;
  if (privacyPolicyVersion) data.privacyPolicyVersion = privacyPolicyVersion;
  
  // Add IP and user agent if request is provided
  if (request) {
    data.ipAddress = request.ip || request.headers['x-forwarded-for'] || request.connection?.remoteAddress;
    data.userAgent = request.headers['user-agent'];
  }
  
  const [logEntry] = await db.insert(consentLogs)
    .values(data)
    .returning();
  
  return logEntry;
}

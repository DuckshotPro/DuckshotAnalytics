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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
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
  updateUserSnapchatCredentials(userId: number, clientId: string, apiKey: string): Promise<User>;
  
  /**
   * Updates a user's subscription status
   * @param userId - The user's ID
   * @param subscription - The subscription tier ("free" or "premium")
   * @param expiresAt - When the subscription expires (null for free tier)
   * @returns The updated user object
   */
  updateUserSubscription(userId: number, subscription: string, expiresAt: Date | null): Promise<User>;
  
  /**
   * Saves Snapchat data for a user
   * @param userId - The user's ID
   * @param data - Snapchat data to save
   * @returns The saved data record
   */
  saveSnapchatData(userId: number, data: any): Promise<SnapchatData>;
  
  /**
   * Gets the most recent Snapchat data for a user
   * @param userId - The user's ID
   * @returns The latest Snapchat data or undefined if none exists
   */
  getLatestSnapchatData(userId: number): Promise<SnapchatData | undefined>;
  
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
   * @returns The updated user object
   * @throws Error if user not found
   */
  async updateUserSnapchatCredentials(userId: number, clientId: string, apiKey: string): Promise<User> {
    const [user] = await db.update(users)
      .set({
        snapchatClientId: clientId,
        snapchatApiKey: apiKey
      })
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
  async getLatestSnapchatData(userId: number): Promise<SnapchatData | undefined> {
    const [latestData] = await db.select()
      .from(snapchatData)
      .where(eq(snapchatData.userId, userId))
      .orderBy(desc(snapchatData.fetchedAt)) // Most recent first
      .limit(1);
    
    return latestData;
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

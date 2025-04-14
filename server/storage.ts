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

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSnapchatCredentials(userId: number, clientId: string, apiKey: string): Promise<User>;
  updateUserSubscription(userId: number, subscription: string, expiresAt: Date | null): Promise<User>;
  saveSnapchatData(userId: number, data: any): Promise<SnapchatData>;
  getLatestSnapchatData(userId: number): Promise<SnapchatData | undefined>;
  saveAiInsight(userId: number, insight: string): Promise<AiInsight>;
  getLatestAiInsight(userId: number): Promise<AiInsight | undefined>;
  sessionStore: any; // Using any for session store type
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Type for session store

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      snapchatClientId: null,
      snapchatApiKey: null,
      subscription: "free",
      subscriptionExpiresAt: null,
    }).returning();
    
    return user;
  }

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

  async getLatestSnapchatData(userId: number): Promise<SnapchatData | undefined> {
    const [latestData] = await db.select()
      .from(snapchatData)
      .where(eq(snapchatData.userId, userId))
      .orderBy(desc(snapchatData.fetchedAt))
      .limit(1);
    
    return latestData;
  }

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

  async getLatestAiInsight(userId: number): Promise<AiInsight | undefined> {
    const [latestInsight] = await db.select()
      .from(aiInsights)
      .where(eq(aiInsights.userId, userId))
      .orderBy(desc(aiInsights.createdAt))
      .limit(1);
    
    return latestInsight;
  }
}

// Import the pool from db.ts
import { pool } from "./db";

// Switch to DatabaseStorage
export const storage = new DatabaseStorage();

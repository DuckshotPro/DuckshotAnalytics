/**
 * Database Schema Definition
 * 
 * This file defines the database schema for the DuckShots SnapAlytics application
 * using Drizzle ORM with PostgreSQL. It also provides Zod schemas for validation
 * and TypeScript type definitions derived from the database schema.
 */

import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Users Table
 * 
 * Stores user account information including:
 * - Authentication credentials
 * - Snapchat API integration details
 * - Subscription status and expiration
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),                            // Unique identifier for the user
  username: text("username").notNull().unique(),            // Username for authentication (must be unique)
  password: text("password").notNull(),                     // Hashed password
  snapchatClientId: text("snapchat_client_id"),             // Snapchat API client ID
  snapchatApiKey: text("snapchat_api_key"),                 // Snapchat API key
  subscription: text("subscription").default("free").notNull(), // Subscription tier ("free" or "premium")
  subscriptionExpiresAt: timestamp("subscription_expires_at"), // When the subscription expires (null for free tier or lifetime)
});

/**
 * Snapchat Data Table
 * 
 * Stores fetched data from the Snapchat API:
 * - Each record represents a snapshot of data at a specific time
 * - Data is stored as a JSON object to accommodate various structures
 * - Linked to a specific user
 */
export const snapchatData = pgTable("snapchat_data", {
  id: serial("id").primaryKey(),                   // Unique identifier for the record
  userId: integer("user_id").notNull(),            // Foreign key to the users table
  data: jsonb("data").notNull(),                   // Snapchat analytics data in JSON format
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(), // When the data was fetched from Snapchat API
});

/**
 * AI Insights Table
 * 
 * Stores AI-generated insights from analytics data:
 * - Each record represents a generated insight
 * - Only available for premium users
 * - Linked to a specific user
 */
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),                   // Unique identifier for the insight
  userId: integer("user_id").notNull(),            // Foreign key to the users table
  insight: text("insight").notNull(),              // The AI-generated insight text
  createdAt: timestamp("created_at").defaultNow().notNull(), // When the insight was generated
});

/**
 * User Registration Schema
 * 
 * Zod schema for validating user registration data
 * Only includes the fields necessary for user creation
 */
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

/**
 * Snapchat Credentials Schema
 * 
 * Zod schema for validating Snapchat API credentials
 * Used when connecting a user's Snapchat account
 */
export const insertSnapchatCredentialsSchema = createInsertSchema(users).pick({
  snapchatClientId: true,
  snapchatApiKey: true,
});

/**
 * Snapchat Data Insertion Schema
 * 
 * Zod schema for validating Snapchat data insertion
 * Used when storing fetched data from Snapchat API
 */
export const insertSnapchatDataSchema = createInsertSchema(snapchatData).pick({
  userId: true,
  data: true,
});

/**
 * AI Insight Insertion Schema
 * 
 * Zod schema for validating AI insight insertion
 * Used when storing generated insights
 */
export const insertAiInsightSchema = createInsertSchema(aiInsights).pick({
  userId: true,
  insight: true,
});

/**
 * TypeScript Type Definitions
 * 
 * These types are inferred from the database schema
 * and provide type safety throughout the application
 */
export type User = typeof users.$inferSelect;                  // Type for a user record
export type InsertUser = z.infer<typeof insertUserSchema>;     // Type for inserting a new user
export type SnapchatCredentials = z.infer<typeof insertSnapchatCredentialsSchema>; // Type for Snapchat credentials
export type SnapchatData = typeof snapchatData.$inferSelect;   // Type for a Snapchat data record
export type InsertSnapchatData = z.infer<typeof insertSnapchatDataSchema>; // Type for inserting Snapchat data
export type AiInsight = typeof aiInsights.$inferSelect;        // Type for an AI insight record
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>; // Type for inserting an AI insight

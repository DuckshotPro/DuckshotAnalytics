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
  email: text("email"),                                     // User's email address for communications
  snapchatClientId: text("snapchat_client_id"),             // Snapchat API client ID
  snapchatApiKey: text("snapchat_api_key"),                 // Snapchat API key
  subscription: text("subscription").default("free").notNull(), // Subscription tier ("free" or "premium")
  subscriptionExpiresAt: timestamp("subscription_expires_at"), // When the subscription expires (null for free tier or lifetime)
  profilePictureUrl: text("profile_picture_url"),           // URL to user's profile picture (often from OAuth)
  displayName: text("display_name"),                        // User's display name (often from OAuth)
  
  // Privacy and consent fields
  dataConsent: boolean("data_consent").default(false),      // Whether user has consented to data collection
  consentDate: timestamp("consent_date"),                   // When the user gave consent
  privacyPolicyVersion: text("privacy_policy_version"),     // Version of privacy policy that was accepted
  
  // Data collection preferences
  allowAnalytics: boolean("allow_analytics").default(true),           // Allow collection of analytics data
  allowDemographics: boolean("allow_demographics").default(true),     // Allow collection of demographic data
  allowLocationData: boolean("allow_location_data").default(false),   // Allow collection of location data
  allowContentAnalysis: boolean("allow_content_analysis").default(true), // Allow analysis of content
  allowThirdPartySharing: boolean("allow_third_party").default(false),  // Allow sharing with third parties
  allowMarketing: boolean("allow_marketing").default(false),            // Allow marketing communications
  
  createdAt: timestamp("created_at").defaultNow().notNull(), // When the user account was created
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // When the user account was last updated
});

/**
 * OAuth Tokens Table
 * 
 * Stores OAuth tokens for third-party service authentication:
 * - Links users to their OAuth provider accounts (e.g., Snapchat)
 * - Stores authentication tokens for API access
 * - Tracks token expiration and scopes
 */
export const oauthTokens = pgTable("oauth_tokens", {
  id: serial("id").primaryKey(),                     // Unique identifier for the token record
  userId: integer("user_id").notNull(),              // Foreign key to the users table
  provider: text("provider").notNull(),              // OAuth provider name (e.g., "snapchat")
  providerUserId: text("provider_user_id").notNull(), // User ID from the provider
  accessToken: text("access_token").notNull(),       // OAuth access token
  refreshToken: text("refresh_token"),               // OAuth refresh token (may be null)
  scope: text("scope"),                              // Authorized scopes
  expiresAt: timestamp("expires_at"),                // When the token expires
  createdAt: timestamp("created_at").defaultNow().notNull(), // When the token was first created
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // When the token was last updated
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
 * Consent Logs Table
 * 
 * Tracks all user consent-related activities for compliance:
 * - Records when users give or withdraw consent
 * - Stores IP address and user agent for audit purposes
 * - Maintains a detailed log for GDPR compliance
 */
export const consentLogs = pgTable("consent_logs", {
  id: serial("id").primaryKey(),                   // Unique identifier for the log entry
  userId: integer("user_id").notNull(),            // Foreign key to the users table
  action: text("action").notNull(),                // Action type ("granted", "withdrawn", "updated")
  detail: text("detail"),                          // Additional details about the consent action
  privacyPolicyVersion: text("privacy_policy_version"), // Version of privacy policy referenced
  ipAddress: text("ip_address"),                   // User's IP address when consent was given/withdrawn
  userAgent: text("user_agent"),                   // User's browser/device information
  createdAt: timestamp("created_at").defaultNow().notNull(), // When the consent action occurred
});

/**
 * Job Execution Logs Table
 * 
 * Tracks all background job executions for monitoring and debugging:
 * - ETL pipeline jobs
 * - Report generation jobs
 * - Data cleanup jobs
 * - Queue processing status
 */
export const jobExecutionLogs = pgTable("job_execution_logs", {
  id: serial("id").primaryKey(),                   // Unique identifier for the job execution
  userId: integer("user_id"),                      // Foreign key to users table (null for system-wide jobs)
  jobType: text("job_type").notNull(),             // Type of job (data-fetch, weekly-reports, data-cleanup)
  status: text("status").notNull(),                // Job status (completed, failed, running)
  executedAt: timestamp("executed_at").defaultNow().notNull(), // When the job was executed
  completedAt: timestamp("completed_at"),          // When the job completed (null if failed or running)
  error: text("error"),                            // Error message if job failed
  metadata: jsonb("metadata"),                     // Additional job metadata (JSON)
  duration: integer("duration"),                   // Job duration in milliseconds
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
  email: true,
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
  dataConsent: true,
  consentDate: true,
  privacyPolicyVersion: true,
});

/**
 * User Data Preferences Schema
 * 
 * Zod schema for validating user data privacy preferences
 * Used for GDPR/CCPA compliance and user data control
 */
export const userDataPreferencesSchema = createInsertSchema(users).pick({
  allowAnalytics: true,
  allowDemographics: true,
  allowLocationData: true,
  allowContentAnalysis: true,
  allowThirdPartySharing: true,
  allowMarketing: true,
});

/**
 * OAuth Token Schema
 * 
 * Zod schema for validating OAuth token data
 * Used when storing OAuth tokens from authentication
 */
export const insertOAuthTokenSchema = createInsertSchema(oauthTokens).pick({
  userId: true,
  provider: true,
  providerUserId: true,
  accessToken: true,
  refreshToken: true,
  scope: true,
  expiresAt: true,
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
export type UserDataPreferences = z.infer<typeof userDataPreferencesSchema>; // Type for user data privacy preferences
export type OAuthToken = typeof oauthTokens.$inferSelect;      // Type for an OAuth token record
export type InsertOAuthToken = z.infer<typeof insertOAuthTokenSchema>; // Type for inserting an OAuth token
export type SnapchatData = typeof snapchatData.$inferSelect;   // Type for a Snapchat data record
export type InsertSnapchatData = z.infer<typeof insertSnapchatDataSchema>; // Type for inserting Snapchat data
export type AiInsight = typeof aiInsights.$inferSelect;        // Type for an AI insight record
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>; // Type for inserting an AI insight

/**
 * Consent Log Insertion Schema
 * 
 * Zod schema for validating consent log insertion
 * Used when recording user consent actions
 */
export const insertConsentLogSchema = createInsertSchema(consentLogs).pick({
  userId: true,
  action: true,
  detail: true,
  privacyPolicyVersion: true,
  ipAddress: true,
  userAgent: true,
});

export type ConsentLog = typeof consentLogs.$inferSelect;       // Type for a consent log record
export type InsertConsentLog = z.infer<typeof insertConsentLogSchema>; // Type for inserting a consent log

/**
 * Job Execution Log Schema
 * 
 * Zod schema for validating job execution log data
 */
export const insertJobExecutionLogSchema = createInsertSchema(jobExecutionLogs).pick({
  userId: true,
  jobType: true,
  status: true,
  executedAt: true,
  completedAt: true,
  error: true,
  metadata: true,
  duration: true,
});

export type JobExecutionLog = typeof jobExecutionLogs.$inferSelect;
export type InsertJobExecutionLog = z.infer<typeof insertJobExecutionLogSchema>;

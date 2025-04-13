import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  snapchatClientId: text("snapchat_client_id"),
  snapchatApiKey: text("snapchat_api_key"),
  subscription: text("subscription").default("free").notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
});

export const snapchatData = pgTable("snapchat_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  data: jsonb("data").notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
});

export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  insight: text("insight").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSnapchatCredentialsSchema = createInsertSchema(users).pick({
  snapchatClientId: true,
  snapchatApiKey: true,
});

export const insertSnapchatDataSchema = createInsertSchema(snapchatData).pick({
  userId: true,
  data: true,
});

export const insertAiInsightSchema = createInsertSchema(aiInsights).pick({
  userId: true,
  insight: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SnapchatCredentials = z.infer<typeof insertSnapchatCredentialsSchema>;
export type SnapchatData = typeof snapchatData.$inferSelect;
export type InsertSnapchatData = z.infer<typeof insertSnapchatDataSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;

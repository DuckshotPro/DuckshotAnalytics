// @ts-nocheck

/**
 * Database Agent
 * 
 * This agent is responsible for storing the fetched data and generated insights
 * in the database.
 */

import { Agent } from "@google/generative-ai-agents";
import { storage } from "../storage";

export class DatabaseAgent extends Agent {
  async run(userId: number, snapchatData: any, insights: string) {
    console.log("Database Agent: Storing data for user", userId);

    // 1. Store Snapchat data
    await storage.saveSnapchatData(userId, snapchatData);

    // 2. Store insights
    await storage.saveAiInsight(userId, insights);

    console.log("Database Agent: Data stored successfully for user", userId);

    return true;
  }
}

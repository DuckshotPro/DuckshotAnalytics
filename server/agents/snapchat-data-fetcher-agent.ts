// @ts-nocheck

/**
 * Snapchat Data Fetcher Agent
 * 
 * This agent is responsible for fetching data from the Snapchat API.
 */

import { Agent } from "@google/generative-ai-agents";
import { artifactService } from "../services/artifact-service";

export class SnapchatDataFetcherAgent extends Agent {
  async run(userId: number) {
    console.log("Snapchat Data Fetcher Agent: Fetching data for user", userId);

    const user = await storage.getUser(userId);

    if (!user || !user.snapchatClientId || !user.snapchatApiKey) {
      throw new Error("Snapchat credentials not found for user " + userId);
    }

    const snapchatData = await fetchSnapchatData(user.snapchatClientId, user.snapchatApiKey);

    // Store the data as an artifact
    const artifact = await artifactService.create({
      name: `snapchat-data-${userId}`,
      content: Buffer.from(JSON.stringify(snapchatData)),
      mimeType: "application/json",
    });

    console.log("Snapchat Data Fetcher Agent: Data fetched and stored as artifact", artifact.name);

    return artifact;
  }
}

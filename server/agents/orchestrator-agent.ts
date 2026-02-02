// @ts-nocheck

/**
 * Orchestrator Agent
 * 
 * This agent is responsible for orchestrating the entire data fetching and 
 * processing workflow for DuckSnapAnalytics.
 */

import { Agent } from "@google/generative-ai-agents";
import { SnapchatDataFetcherAgent } from "./snapchat-data-fetcher-agent";
import { DataAnalysisAgent } from "./data-analysis-agent";
import { TestAgent } from "./test-agent";
import { DatabaseAgent } from "./database-agent";

import { SafetyAgent } from "./safety-agent";
import { EvaluationAgent } from "./evaluation-agent";
import { LoggingPlugin } from "../plugins/logging-plugin";

export class OrchestratorAgent extends Agent {
  constructor() {
    super();
    this.addPlugin(new LoggingPlugin());
  }

  async run(userId: number) {
    // 1. Fetch Snapchat data
    const snapchatDataArtifact = await new SnapchatDataFetcherAgent().run(userId);

    // 2. Analyze data
    const insightArtifact = await new DataAnalysisAgent().run(snapchatDataArtifact);

    // 3. Validate data
    const snapchatData = JSON.parse(snapchatDataArtifact.content.toString());
    const insights = insightArtifact.content.toString();
    await new TestAgent().run(snapchatData, insights);

    // 4. Screen data for safety
    await new SafetyAgent().run(snapchatData, insights);

    // 5. Evaluate insights
    await new EvaluationAgent().run(insights);

    // 6. Store data
    await new DatabaseAgent().run(userId, snapchatData, insights);

    return { snapchatData, insights };
  }
}

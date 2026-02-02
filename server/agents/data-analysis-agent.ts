// @ts-nocheck

/**
 * Data Analysis Agent
 * 
 * This agent is responsible for analyzing Snapchat data and generating insights.
 */

import { Agent } from "@google/generative-ai-agents";
import { artifactService } from "../services/artifact-service";

export class DataAnalysisAgent extends Agent {
  async run(snapchatDataArtifact: any) {
    console.log("Data Analysis Agent: Analyzing data from artifact", snapchatDataArtifact.name);

    // Retrieve the data from the artifact
    const snapchatData = JSON.parse(snapchatDataArtifact.content.toString());

    const insight = await generateAiInsight(snapchatData);

    // Store the insights as an artifact
    const insightArtifact = await artifactService.create({
      name: `insight-${snapchatDataArtifact.name}`,
      content: Buffer.from(insight),
      mimeType: "text/plain",
    });

    console.log("Data Analysis Agent: Analysis complete and stored as artifact", insightArtifact.name);

    return insightArtifact;
  }
}

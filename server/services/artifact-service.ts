
/**
 * Artifact Service
 * 
 * This service is responsible for storing and retrieving artifacts.
 */

import { InMemoryArtifactService } from "@google/generative-ai-agents";

export const artifactService = new InMemoryArtifactService();

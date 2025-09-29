
/**
 * Logging Plugin
 * 
 * This plugin logs all agent invocations.
 */

import { BasePlugin } from "@google/generative-ai-agents";
import logger from "../logger";

export class LoggingPlugin extends BasePlugin {
  onAgentStart(agent: any) {
    logger.info("Agent started", { agent: agent.constructor.name });
  }

  onAgentEnd(agent: any) {
    logger.info("Agent ended", { agent: agent.constructor.name });
  }

  onAgentError(agent: any, error: Error) {
    logger.error("Agent error", { agent: agent.constructor.name, error });
  }
}

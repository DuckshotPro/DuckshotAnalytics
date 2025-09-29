"""
Logging Plugin

This plugin logs all agent invocations and lifecycle events.
"""

from typing import Any, Optional
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from logger import logger


class LoggingPlugin:
    """
    Plugin that logs agent lifecycle events.
    This can be attached to agents to track their execution.
    """
    
    def on_agent_start(self, agent: Any, *args, **kwargs):
        """
        Called when an agent starts execution
        
        Args:
            agent: The agent instance
            *args: Positional arguments passed to the agent
            **kwargs: Keyword arguments passed to the agent
        """
        agent_name = agent.__class__.__name__
        logger.info("Agent started", {"agent": agent_name})
    
    def on_agent_end(self, agent: Any, result: Any):
        """
        Called when an agent completes execution
        
        Args:
            agent: The agent instance
            result: The result returned by the agent
        """
        agent_name = agent.__class__.__name__
        logger.info("Agent ended", {"agent": agent_name})
    
    def on_agent_error(self, agent: Any, error: Exception):
        """
        Called when an agent encounters an error
        
        Args:
            agent: The agent instance
            error: The exception that occurred
        """
        agent_name = agent.__class__.__name__
        logger.error("Agent error", {
            "agent": agent_name,
            "error": str(error),
            "error_type": type(error).__name__
        })
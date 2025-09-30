"""
Base Agent

This module provides the base Agent class that all agents inherit from.
"""

from typing import Any, List, Optional
from abc import ABC, abstractmethod
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from plugins.logging_plugin import LoggingPlugin


class Agent(ABC):
    """
    Base class for all agents in the system.
    Provides plugin management and lifecycle hooks.
    """
    
    def __init__(self):
        self._plugins: List[Any] = []
    
    def add_plugin(self, plugin: Any) -> None:
        """
        Add a plugin to this agent
        
        Args:
            plugin: Plugin instance to add
        """
        self._plugins.append(plugin)
    
    def _trigger_start(self, *args, **kwargs):
        """Trigger on_agent_start hooks in all plugins"""
        for plugin in self._plugins:
            if hasattr(plugin, 'on_agent_start'):
                plugin.on_agent_start(self, *args, **kwargs)
    
    def _trigger_end(self, result: Any):
        """Trigger on_agent_end hooks in all plugins"""
        for plugin in self._plugins:
            if hasattr(plugin, 'on_agent_end'):
                plugin.on_agent_end(self, result)
    
    def _trigger_error(self, error: Exception):
        """Trigger on_agent_error hooks in all plugins"""
        for plugin in self._plugins:
            if hasattr(plugin, 'on_agent_error'):
                plugin.on_agent_error(self, error)
    
    @abstractmethod
    async def run(self, *args, **kwargs) -> Any:
        """
        Main execution method for the agent.
        Must be implemented by subclasses.
        """
        pass
    
    async def execute(self, *args, **kwargs) -> Any:
        """
        Execute the agent with plugin lifecycle hooks
        
        Returns:
            The result from the agent's run method
        """
        try:
            self._trigger_start(*args, **kwargs)
            result = await self.run(*args, **kwargs)
            self._trigger_end(result)
            return result
        except Exception as error:
            self._trigger_error(error)
            raise
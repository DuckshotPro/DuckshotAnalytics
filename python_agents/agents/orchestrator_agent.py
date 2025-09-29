"""
Orchestrator Agent

This agent is responsible for orchestrating the entire data fetching and
processing workflow for DuckSnapAnalytics.
"""

import sys
import os
import json
from typing import Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.base_agent import Agent
from agents.snapchat_data_fetcher_agent import SnapchatDataFetcherAgent
from agents.data_analysis_agent import DataAnalysisAgent
from agents.test_agent import TestAgent
from agents.database_agent import DatabaseAgent
from agents.safety_agent import SafetyAgent
from agents.evaluation_agent import EvaluationAgent
from plugins.logging_plugin import LoggingPlugin


class OrchestratorAgent(Agent):
    """
    Orchestrator agent that coordinates the complete data processing workflow.
    
    This agent:
    1. Coordinates all sub-agents
    2. Manages the data flow between agents
    3. Provides centralized logging
    
    The workflow:
    1. Fetch Snapchat data (SnapchatDataFetcherAgent)
    2. Analyze data and generate insights (DataAnalysisAgent)
    3. Validate data and insights (TestAgent)
    4. Screen for safety issues (SafetyAgent)
    5. Evaluate insight quality (EvaluationAgent)
    6. Store data in database (DatabaseAgent)
    """
    
    def __init__(self):
        super().__init__()
        # Add logging plugin to orchestrator
        self.add_plugin(LoggingPlugin())
        
        # Initialize sub-agents with logging plugin
        self.snapchat_fetcher = SnapchatDataFetcherAgent()
        self.snapchat_fetcher.add_plugin(LoggingPlugin())
        
        self.data_analyzer = DataAnalysisAgent()
        self.data_analyzer.add_plugin(LoggingPlugin())
        
        self.test_agent = TestAgent()
        self.test_agent.add_plugin(LoggingPlugin())
        
        self.safety_agent = SafetyAgent()
        self.safety_agent.add_plugin(LoggingPlugin())
        
        self.evaluation_agent = EvaluationAgent()
        self.evaluation_agent.add_plugin(LoggingPlugin())
        
        self.database_agent = DatabaseAgent()
        self.database_agent.add_plugin(LoggingPlugin())
    
    async def run(self, user_id: int) -> Dict[str, Any]:
        """
        Execute the complete data processing workflow
        
        Args:
            user_id: The ID of the user to process data for
        
        Returns:
            Dictionary containing snapchatData and insights
        
        Raises:
            Exception: If any step in the workflow fails
        """
        # 1. Fetch Snapchat data
        snapchat_data_artifact = await self.snapchat_fetcher.execute(user_id)
        
        # 2. Analyze data
        insight_artifact = await self.data_analyzer.execute(snapchat_data_artifact)
        
        # 3. Parse artifacts with error handling
        try:
            snapchat_data = json.loads(snapchat_data_artifact.content.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError) as error:
            print(f"Orchestrator Agent: Failed to parse snapchatData artifact - {error}")
            raise ValueError(f"Invalid Snapchat data format in artifact: {error}")
        
        insights = insight_artifact.content.decode('utf-8')
        
        # 4. Validate data
        await self.test_agent.execute(snapchat_data, insights)
        
        # 5. Screen data for safety
        await self.safety_agent.execute(snapchat_data, insights)
        
        # 6. Evaluate insights
        await self.evaluation_agent.execute(insights)
        
        # 7. Store data
        await self.database_agent.execute(user_id, snapchat_data, insights)
        
        return {
            "snapchatData": snapchat_data,
            "insights": insights
        }
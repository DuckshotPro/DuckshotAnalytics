"""
Data Analysis Agent

This agent is responsible for analyzing Snapchat data and generating insights.
"""

import sys
import os
import json

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.base_agent import Agent
from services.artifact_service import artifact_service, Artifact
from services.gemini import generate_ai_insight


class DataAnalysisAgent(Agent):
    """
    Agent responsible for analyzing Snapchat data and generating insights.
    
    This agent:
    1. Retrieves Snapchat data from an artifact
    2. Analyzes the data using AI (Gemini)
    3. Stores the insights as a new artifact
    """
    
    async def run(self, snapchat_data_artifact: Artifact):
        """
        Analyze Snapchat data and generate insights
        
        Args:
            snapchat_data_artifact: Artifact containing Snapchat data
        
        Returns:
            Artifact containing the generated insights
        
        Raises:
            ValueError: If artifact content is invalid JSON
        """
        print(f"Data Analysis Agent: Analyzing data from artifact {snapchat_data_artifact.name}")
        
        # Retrieve and parse the data from the artifact with error handling
        try:
            snapchat_data = json.loads(snapchat_data_artifact.content.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError) as error:
            print(f"Data Analysis Agent: Failed to parse snapchatData artifact - {error}")
            raise ValueError(f"Invalid Snapchat data format in artifact: {error}")
        
        # Generate insights using AI
        insight = await generate_ai_insight(snapchat_data)
        
        # Store the insights as an artifact
        insight_artifact = await artifact_service.create(
            name=f"insight-{snapchat_data_artifact.name}",
            content=insight.encode('utf-8'),
            mime_type="text/plain"
        )
        
        print(f"Data Analysis Agent: Analysis complete and stored as artifact {insight_artifact.name}")
        
        return insight_artifact
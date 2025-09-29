"""
Snapchat Data Fetcher Agent

This agent is responsible for fetching data from the Snapchat API.
"""

import sys
import os
import json

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.base_agent import Agent
from services.artifact_service import artifact_service
from services.storage import storage
from services.snapchat import fetch_snapchat_data


class SnapchatDataFetcherAgent(Agent):
    """
    Agent responsible for fetching Snapchat analytics data.
    
    This agent:
    1. Retrieves user credentials from storage
    2. Fetches data from Snapchat API
    3. Stores the result as an artifact
    """
    
    async def run(self, user_id: int):
        """
        Fetch Snapchat data for a user
        
        Args:
            user_id: The ID of the user to fetch data for
        
        Returns:
            Artifact containing the Snapchat data
        
        Raises:
            ValueError: If user not found or credentials missing
        """
        print(f"Snapchat Data Fetcher Agent: Fetching data for user {user_id}")
        
        # Get user from storage
        user = await storage.get_user(user_id)
        
        if not user or not user.snapchat_client_id or not user.snapchat_api_key:
            raise ValueError(f"Snapchat credentials not found for user {user_id}")
        
        # Fetch data from Snapchat API
        snapchat_data = await fetch_snapchat_data(
            user.snapchat_client_id,
            user.snapchat_api_key
        )
        
        # Store the data as an artifact
        artifact = await artifact_service.create(
            name=f"snapchat-data-{user_id}",
            content=json.dumps(snapchat_data).encode('utf-8'),
            mime_type="application/json"
        )
        
        print(f"Snapchat Data Fetcher Agent: Data fetched and stored as artifact {artifact.name}")
        
        return artifact
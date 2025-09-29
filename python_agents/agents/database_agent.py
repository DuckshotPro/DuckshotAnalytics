"""
Database Agent

This agent is responsible for storing the fetched data and generated insights
in the database.
"""

import sys
import os
from typing import Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.base_agent import Agent
from services.storage import storage


class DatabaseAgent(Agent):
    """
    Agent responsible for persisting data to the database.
    
    This agent:
    1. Stores Snapchat data in the database
    2. Stores AI-generated insights in the database
    """
    
    async def run(self, user_id: int, snapchat_data: Dict[str, Any], insights: str) -> bool:
        """
        Store data and insights in the database
        
        Args:
            user_id: The ID of the user
            snapchat_data: Snapchat analytics data
            insights: Generated insights
        
        Returns:
            True if storage is successful
        
        Raises:
            Exception: If storage fails
        """
        print(f"Database Agent: Storing data for user {user_id}")
        
        # 1. Store Snapchat data
        await storage.save_snapchat_data(user_id, snapchat_data)
        
        # 2. Store insights
        await storage.save_ai_insight(user_id, insights)
        
        print(f"Database Agent: Data stored successfully for user {user_id}")
        
        return True
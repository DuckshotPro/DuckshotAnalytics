"""
Snapchat Service

This module provides functions for interacting with the Snapchat API.
In a production environment, this would make actual API calls.
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
import random


def generate_followers_data() -> List[Dict[str, Any]]:
    """Generate simulated follower growth data"""
    data = []
    base_date = datetime.now() - timedelta(days=30)
    
    for i in range(31):
        date = base_date + timedelta(days=i)
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "followers": 20000 + (i * 150) + random.randint(-50, 50)
        })
    
    return data


async def fetch_snapchat_data(client_id: str, api_key: str) -> Dict[str, Any]:
    """
    Fetch data from Snapchat API
    
    Args:
        client_id: Snapchat client ID
        api_key: Snapchat API key
    
    Returns:
        Dictionary containing Snapchat analytics data
    
    Raises:
        ValueError: If credentials are invalid
    """
    # Validate credentials
    if not client_id or not api_key:
        raise ValueError("Invalid Snapchat API credentials")
    
    # In a real implementation, this would call the Snapchat API
    # For now, return simulated data
    return {
        "totalFollowers": 24583,
        "followerGrowth": 12.3,
        "totalStoryViews": 15942,
        "storyViewsGrowth": 8.7,
        "engagementRate": 5.2,
        "engagementRateChange": -2.1,
        "completionRate": 78.3,
        "completionRateChange": 3.5,
        "lastUpdated": datetime.now().isoformat(),
        
        # Data for audience growth chart
        "followers": generate_followers_data(),
        
        # Data for demographics chart
        "demographics": [
            {"ageRange": "18-24", "percentage": 45},
            {"ageRange": "25-34", "percentage": 30},
            {"ageRange": "35-44", "percentage": 15},
            {"ageRange": "45+", "percentage": 10},
        ],
        
        # Data for content table
        "content": [
            {
                "id": "1",
                "title": "Summer Party Snap",
                "date": "2023-07-24",
                "views": 8452,
                "completion": 85,
                "screenshots": 214,
                "shares": 126,
            },
            {
                "id": "2",
                "title": "Beach Day",
                "date": "2023-07-22",
                "views": 7128,
                "completion": 72,
                "screenshots": 178,
                "shares": 94,
            },
            {
                "id": "3",
                "title": "New Product Reveal",
                "date": "2023-07-20",
                "views": 9834,
                "completion": 91,
                "screenshots": 412,
                "shares": 203,
            },
            {
                "id": "4",
                "title": "Behind The Scenes",
                "date": "2023-07-18",
                "views": 6453,
                "completion": 68,
                "screenshots": 145,
                "shares": 87,
            },
            {
                "id": "5",
                "title": "Q&A Session",
                "date": "2023-07-16",
                "views": 5892,
                "completion": 79,
                "screenshots": 201,
                "shares": 156,
            },
        ],
    }
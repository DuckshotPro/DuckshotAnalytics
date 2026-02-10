
import requests

def fetch_snapchat_data(client_id: str, api_key: str) -> dict:
    # In a real implementation, this would call the Snapchat API
    # For now, we'll return simulated data

    if not client_id or not api_key:
        raise Exception("Invalid Snapchat API credentials")

    return {
        "totalFollowers": 24583,
        "followerGrowth": 12.3,
        "totalStoryViews": 15942,
        "storyViewsGrowth": 8.7,
        "engagementRate": 5.2,
        "engagementRateChange": -2.1,
        "completionRate": 78.3,
        "completionRateChange": 3.5,
        "lastUpdated": "2025-09-29T12:00:00.000Z",
    }

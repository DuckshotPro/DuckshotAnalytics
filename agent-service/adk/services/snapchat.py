
from adk.agent import Agent
from adk.services.storage import storage
from adk.services.snapchat_api import fetch_snapchat_data

class SnapchatDataFetcherAgent(Agent):
    def run(self, user_id: int):
        print(f"Snapchat Data Fetcher Agent: Fetching data for user {user_id}")

        user = storage.get_user(user_id)

        if not user or not user.snapchat_client_id or not user.snapchat_api_key:
            raise Exception(f"Snapchat credentials not found for user {user_id}")

        snapchat_data = fetch_snapchat_data(user.snapchat_client_id, user.snapchat_api_key)
        storage.save_snapchat_data(user_id, snapchat_data)

        print(f"Snapchat Data Fetcher Agent: Data fetched successfully for user {user_id}")

        return snapchat_data

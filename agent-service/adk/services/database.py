
from adk.agent import Agent
from adk.services.storage import storage

class DatabaseAgent(Agent):
    def run(self, user_id: int, snapchat_data: dict, insights: str):
        print(f"Database Agent: Storing data for user {user_id}")

        # 1. Store Snapchat data
        storage.save_snapchat_data(user_id, snapchat_data)

        # 2. Store insights
        storage.save_ai_insight(user_id, insights)

        print(f"Database Agent: Data stored successfully for user {user_id}")

        return True

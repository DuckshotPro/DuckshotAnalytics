
from adk.agent import Agent

class TestAgent(Agent):
    def run(self, snapchat_data: dict, insights: str):
        print("Test Agent: Validating data")

        # 1. Validate Snapchat data
        if not snapchat_data or not snapchat_data.get("totalFollowers"):
            raise Exception("Invalid Snapchat data: missing totalFollowers")

        # 2. Validate insights
        if not insights or not isinstance(insights, str):
            raise Exception("Invalid insights: not a string")

        print("Test Agent: Data validation complete")

        return True

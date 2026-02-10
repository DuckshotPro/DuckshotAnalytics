
from adk.agent import Agent
from adk.services.snapchat import SnapchatDataFetcherAgent
from adk.services.analysis import DataAnalysisAgent
from adk.services.test import TestAgent
from adk.services.database import DatabaseAgent
from adk.services.safety import SafetyAgent
from adk.services.evaluation import EvaluationAgent

class OrchestratorAgent(Agent):
    def run(self, user_id: int):
        print(f"Orchestrator Agent: Starting workflow for user {user_id}")

        # 1. Fetch Snapchat data
        snapchat_data = SnapchatDataFetcherAgent().run(user_id)

        # 2. Analyze data
        insights = DataAnalysisAgent().run(snapchat_data)

        # 3. Validate data
        TestAgent().run(snapchat_data, insights)

        # 4. Screen data for safety
        SafetyAgent().run(snapchat_data, insights)

        # 5. Evaluate insights
        EvaluationAgent().run(insights)

        # 6. Store data
        DatabaseAgent().run(user_id, snapchat_data, insights)

        print(f"Orchestrator Agent: Workflow completed for user {user_id}")

        return {"snapchat_data": snapchat_data, "insights": insights}


from adk.agent import Agent
from adk.services.gemini import generate_ai_insight

class DataAnalysisAgent(Agent):
    def run(self, snapchat_data: dict):
        print("Data Analysis Agent: Analyzing data")

        insight = generate_ai_insight(snapchat_data)

        print("Data Analysis Agent: Analysis complete")

        return insight

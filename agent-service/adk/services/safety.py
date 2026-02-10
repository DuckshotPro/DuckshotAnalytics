
from adk.agent import Agent

class SafetyAgent(Agent):
    def run(self, snapchat_data: dict, insights: str):
        print("Safety Agent: Screening data")

        # 1. Screen Snapchat data for PII
        if self.contains_pii(snapchat_data):
            raise Exception("Snapchat data contains PII")

        # 2. Screen insights for inappropriate content
        if self.contains_inappropriate_content(insights):
            raise Exception("Insights contain inappropriate content")

        print("Safety Agent: Data screening complete")

        return True

    def contains_pii(self, data: dict) -> bool:
        # TODO: Implement PII detection logic
        return False

    def contains_inappropriate_content(self, text: str) -> bool:
        # TODO: Implement inappropriate content detection logic
        return False

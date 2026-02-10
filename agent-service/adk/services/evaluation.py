
from adk.agent import Agent

class EvaluationAgent(Agent):
    def run(self, insights: str):
        print("Evaluation Agent: Evaluating insights")

        # 1. Check if the insights are relevant
        if not self.is_relevant(insights):
            raise Exception("Insights are not relevant")

        # 2. Check if the insights are actionable
        if not self.is_actionable(insights):
            raise Exception("Insights are not actionable")

        print("Evaluation Agent: Insights evaluation complete")

        return True

    def is_relevant(self, insights: str) -> bool:
        # TODO: Implement relevance evaluation logic
        return True

    def is_actionable(self, insights: str) -> bool:
        # TODO: Implement actionability evaluation logic
        return True

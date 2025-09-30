"""
Evaluation Agent

This agent is responsible for evaluating the quality of the generated insights.
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.base_agent import Agent


class EvaluationAgent(Agent):
    """
    Agent responsible for evaluating insight quality.
    
    This agent:
    1. Checks if insights are relevant to the data
    2. Checks if insights are actionable for the user
    """
    
    async def run(self, insights: str) -> bool:
        """
        Evaluate the quality of generated insights
        
        Args:
            insights: Generated insight text
        
        Returns:
            True if evaluation passes
        
        Raises:
            ValueError: If evaluation fails
        """
        print("Evaluation Agent: Evaluating insights")
        
        # 1. Check if the insights are relevant
        if not self._is_relevant(insights):
            raise ValueError("Insights are not relevant")
        
        # 2. Check if the insights are actionable
        if not self._is_actionable(insights):
            raise ValueError("Insights are not actionable")
        
        print("Evaluation Agent: Insights evaluation complete")
        
        return True
    
    def _is_relevant(self, insights: str) -> bool:
        """
        Check if insights are relevant
        
        Args:
            insights: Insight text to evaluate
        
        Returns:
            True if insights are relevant
        """
        # TODO: Implement relevance evaluation logic
        # This could use NLP techniques to check if insights:
        # - Relate to the input data
        # - Are specific rather than generic
        # - Address key metrics
        return True
    
    def _is_actionable(self, insights: str) -> bool:
        """
        Check if insights are actionable
        
        Args:
            insights: Insight text to evaluate
        
        Returns:
            True if insights are actionable
        """
        # TODO: Implement actionability evaluation logic
        # This could check if insights:
        # - Contain specific recommendations
        # - Have clear next steps
        # - Are implementable by the user
        return True
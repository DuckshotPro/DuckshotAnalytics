"""
Example script demonstrating how to use the Python agent system.

This script shows:
1. How to set up test data
2. How to use the OrchestratorAgent
3. How to use individual agents
"""

import asyncio
import sys
import os

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.orchestrator_agent import OrchestratorAgent
from agents.snapchat_data_fetcher_agent import SnapchatDataFetcherAgent
from agents.data_analysis_agent import DataAnalysisAgent
from services.storage import storage, User
from plugins.logging_plugin import LoggingPlugin


async def example_full_workflow():
    """
    Example 1: Complete workflow using the OrchestratorAgent
    """
    print("=" * 60)
    print("Example 1: Full Workflow with OrchestratorAgent")
    print("=" * 60)
    
    # Create a test user (in production, this would come from your database)
    user = User(
        id=1,
        username="test_user",
        snapchat_client_id="test_client_id",
        snapchat_api_key="test_api_key"
    )
    
    # Add user to storage (mock)
    storage._users[1] = user
    
    # Create orchestrator
    orchestrator = OrchestratorAgent()
    
    try:
        # Run the complete workflow
        print("\nStarting orchestration...")
        result = await orchestrator.execute(user_id=1)
        
        print("\n✓ Workflow completed successfully!")
        print(f"\nTotal Followers: {result['snapchatData']['totalFollowers']}")
        print(f"Engagement Rate: {result['snapchatData']['engagementRate']}%")
        print(f"\nGenerated Insight:\n{result['insights']}")
        
    except Exception as e:
        print(f"\n✗ Workflow failed: {e}")
        raise


async def example_individual_agents():
    """
    Example 2: Using individual agents
    """
    print("\n" + "=" * 60)
    print("Example 2: Using Individual Agents")
    print("=" * 60)
    
    # Create agents
    fetcher = SnapchatDataFetcherAgent()
    analyzer = DataAnalysisAgent()
    
    # Add logging plugin
    fetcher.add_plugin(LoggingPlugin())
    analyzer.add_plugin(LoggingPlugin())
    
    try:
        # Fetch data
        print("\nFetching Snapchat data...")
        data_artifact = await fetcher.execute(user_id=1)
        print(f"✓ Data fetched: {data_artifact.name}")
        
        # Analyze data
        print("\nAnalyzing data...")
        insight_artifact = await analyzer.execute(data_artifact)
        print(f"✓ Analysis complete: {insight_artifact.name}")
        
        # Display results
        insights = insight_artifact.content.decode('utf-8')
        print(f"\nGenerated Insight:\n{insights}")
        
    except Exception as e:
        print(f"\n✗ Failed: {e}")
        raise


async def example_with_error_handling():
    """
    Example 3: Error handling demonstration
    """
    print("\n" + "=" * 60)
    print("Example 3: Error Handling")
    print("=" * 60)
    
    # Try to fetch data for non-existent user
    fetcher = SnapchatDataFetcherAgent()
    fetcher.add_plugin(LoggingPlugin())
    
    print("\nAttempting to fetch data for non-existent user...")
    try:
        await fetcher.execute(user_id=999)
        print("✗ This should not print!")
    except ValueError as e:
        print(f"✓ Caught expected error: {e}")


async def main():
    """
    Run all examples
    """
    print("\nPython Agent System - Examples")
    print("=" * 60)
    
    try:
        # Example 1: Full workflow
        await example_full_workflow()
        
        # Example 2: Individual agents
        await example_individual_agents()
        
        # Example 3: Error handling
        await example_with_error_handling()
        
        print("\n" + "=" * 60)
        print("All examples completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n\nExample failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
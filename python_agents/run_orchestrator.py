#!/usr/bin/env python3
"""
CLI script to run the OrchestratorAgent

Usage:
    python3 run_orchestrator.py <user_id>
    python3 run_orchestrator.py <user_id> --setup-test-user

Example:
    python3 run_orchestrator.py 1 --setup-test-user
"""

import sys
import os
import asyncio
import json
import argparse

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.orchestrator_agent import OrchestratorAgent
from services.storage import storage, User


async def setup_test_user(user_id: int):
    """Create a test user for demonstration purposes"""
    user = User(
        id=user_id,
        username=f"test_user_{user_id}",
        snapchat_client_id="test_client_id",
        snapchat_api_key="test_api_key"
    )
    storage._users[user_id] = user
    print(f"✓ Created test user: {user.username}")


async def main(user_id: int, setup_user: bool = False):
    """
    Run the orchestrator agent for a user
    
    Args:
        user_id: The ID of the user to process
        setup_user: If True, create a test user first
    """
    try:
        # Setup test user if requested
        if setup_user:
            await setup_test_user(user_id)
        
        # Create and run orchestrator
        print(f"\nStarting orchestrator for user {user_id}...")
        orchestrator = OrchestratorAgent()
        result = await orchestrator.execute(user_id=user_id)
        
        # Output results as JSON
        print("\n" + "=" * 60)
        print("RESULTS")
        print("=" * 60)
        print(json.dumps(result, indent=2, default=str))
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Run the OrchestratorAgent for a user"
    )
    parser.add_argument(
        "user_id",
        type=int,
        help="The ID of the user to process"
    )
    parser.add_argument(
        "--setup-test-user",
        action="store_true",
        help="Create a test user before running (for testing)"
    )
    
    args = parser.parse_args()
    
    exit_code = asyncio.run(main(args.user_id, args.setup_test_user))
    sys.exit(exit_code)
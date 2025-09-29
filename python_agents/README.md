# Python Agent System for DuckSnapAnalytics

This is a Python implementation of the agent-based system for analytics and data processing, converted from the original TypeScript implementation.

## Overview

The system provides a modular, scalable architecture for processing Snapchat analytics data using specialized agents that handle different aspects of the data pipeline.

## Architecture

The system consists of seven specialized agents:

1. **OrchestratorAgent** - Coordinates the complete workflow
2. **SnapchatDataFetcherAgent** - Fetches data from Snapchat API
3. **DataAnalysisAgent** - Analyzes data and generates insights using AI
4. **TestAgent** - Validates data integrity
5. **SafetyAgent** - Screens data for PII and inappropriate content
6. **EvaluationAgent** - Evaluates insight quality
7. **DatabaseAgent** - Persists data to the database

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Install Dependencies

```bash
cd python_agents
pip install -r requirements.txt
```

## Usage

### Basic Example

```python
import asyncio
from agents.orchestrator_agent import OrchestratorAgent
from services.storage import storage, User

async def main():
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
    
    # Run the workflow
    result = await orchestrator.execute(user_id=1)
    
    print("Snapchat Data:", result["snapchatData"])
    print("Insights:", result["insights"])

if __name__ == "__main__":
    asyncio.run(main())
```

### Using Individual Agents

You can also use individual agents directly:

```python
import asyncio
from agents.snapchat_data_fetcher_agent import SnapchatDataFetcherAgent
from agents.data_analysis_agent import DataAnalysisAgent
from plugins.logging_plugin import LoggingPlugin

async def main():
    # Create agents
    fetcher = SnapchatDataFetcherAgent()
    analyzer = DataAnalysisAgent()
    
    # Add logging plugin
    fetcher.add_plugin(LoggingPlugin())
    analyzer.add_plugin(LoggingPlugin())
    
    # Fetch data
    data_artifact = await fetcher.execute(user_id=1)
    
    # Analyze data
    insight_artifact = await analyzer.execute(data_artifact)
    
    print("Insights:", insight_artifact.content.decode('utf-8'))

if __name__ == "__main__":
    asyncio.run(main())
```

## Project Structure

```
python_agents/
├── __init__.py
├── logger.py                    # Logging infrastructure
├── requirements.txt             # Python dependencies
├── README.md                    # This file
├── example.py                   # Example usage script
├── agents/                      # Agent implementations
│   ├── __init__.py
│   ├── base_agent.py           # Base agent class
│   ├── orchestrator_agent.py
│   ├── snapchat_data_fetcher_agent.py
│   ├── data_analysis_agent.py
│   ├── test_agent.py
│   ├── safety_agent.py
│   ├── evaluation_agent.py
│   └── database_agent.py
├── plugins/                     # Plugin implementations
│   ├── __init__.py
│   └── logging_plugin.py
└── services/                    # Service modules
    ├── __init__.py
    ├── artifact_service.py
    ├── storage.py
    ├── snapchat.py
    └── gemini.py
```

## Key Features

### 1. Modular Architecture

Each agent has a single responsibility, making the system easy to maintain and extend.

### 2. Plugin System

Agents support plugins for cross-cutting concerns like logging:

```python
from agents.base_agent import Agent
from plugins.logging_plugin import LoggingPlugin

agent = SomeAgent()
agent.add_plugin(LoggingPlugin())
```

### 3. Error Handling

All agents include proper error handling with descriptive error messages:

- JSON parsing errors are caught and reported
- Missing data is validated
- All errors include context for debugging

### 4. Artifact Management

Data flows between agents using artifacts, which provide:
- Type safety (MIME types)
- Metadata support
- Temporal tracking (creation timestamps)

### 5. Async/Await Support

All agents use Python's async/await for efficient I/O operations.

## Improvements Over TypeScript Version

This Python implementation addresses all issues mentioned in the PR review:

1. ✅ **Fixed Missing Imports** - All imports are properly included
2. ✅ **Added Error Handling** - JSON parsing wrapped in try-catch blocks
3. ✅ **Efficient Agent Instantiation** - Agents instantiated once in constructor
4. ✅ **Centralized Logging** - LoggingPlugin added to all agents
5. ✅ **Type Safety** - Using Python type hints throughout

## Testing

Run the example script to test the system:

```bash
cd python_agents
python example.py
```

## Production Considerations

### 1. Database Integration

Replace the mock `StorageService` with actual database calls:

```python
# services/storage.py
class StorageService:
    async def get_user(self, user_id: int):
        # Replace with actual database query
        async with db.pool.acquire() as conn:
            return await conn.fetchrow(
                "SELECT * FROM users WHERE id = $1", user_id
            )
```

### 2. API Integration

Replace mock API calls with actual Snapchat API integration:

```python
# services/snapchat.py
async def fetch_snapchat_data(client_id: str, api_key: str):
    async with aiohttp.ClientSession() as session:
        async with session.get(
            "https://api.snapchat.com/...",
            headers={"Authorization": f"Bearer {api_key}"}
        ) as response:
            return await response.json()
```

### 3. Gemini API Integration

Integrate with actual Google Gemini API:

```python
# services/gemini.py
import google.generativeai as genai

async def generate_ai_insight(snapchat_data: Dict[str, Any]) -> str:
    model = genai.GenerativeModel('gemini-pro')
    response = await model.generate_content_async(
        f"Analyze this Snapchat data and provide insights: {snapchat_data}"
    )
    return response.text
```

### 4. Persistent Artifact Storage

Replace in-memory artifacts with persistent storage (S3, database, etc.):

```python
# services/artifact_service.py
class S3ArtifactService:
    async def create(self, name: str, content: bytes, mime_type: str):
        # Upload to S3
        await s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=name,
            Body=content,
            ContentType=mime_type
        )
```

## Migration from TypeScript

If you're migrating from the TypeScript implementation:

1. Install Python dependencies: `pip install -r requirements.txt`
2. Update your job scheduler to call Python agents
3. Ensure your database schema is compatible
4. Update API endpoints to use Python agent execution

## Contributing

When adding new agents:

1. Extend the `Agent` base class
2. Implement the `run()` method
3. Add proper error handling
4. Include type hints
5. Add logging statements
6. Update documentation

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please create an issue in the repository.
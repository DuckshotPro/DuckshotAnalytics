# Migration Guide: TypeScript to Python Agents

This guide helps you migrate from the TypeScript agent implementation to the Python agent system.

## Overview of Changes

The Python implementation addresses all issues identified in the PR review:

### ✅ Fixed Issues

1. **Missing Imports** - All required functions (`storage`, `fetchSnapchatData`, `generateAiInsight`) are properly imported
2. **Error Handling** - JSON parsing is wrapped in try-catch blocks with descriptive error messages
3. **Agent Instantiation** - Agents are instantiated once in the constructor and reused (efficiency improvement)
4. **Logging Coverage** - LoggingPlugin is added to all agents, not just the orchestrator
5. **Type Safety** - Python type hints are used throughout for better code quality

## File Mapping

| TypeScript File | Python File |
|----------------|-------------|
| `server/agents/orchestrator-agent.ts` | `python_agents/agents/orchestrator_agent.py` |
| `server/agents/snapchat-data-fetcher-agent.ts` | `python_agents/agents/snapchat_data_fetcher_agent.py` |
| `server/agents/data-analysis-agent.ts` | `python_agents/agents/data_analysis_agent.py` |
| `server/agents/test-agent.ts` | `python_agents/agents/test_agent.py` |
| `server/agents/safety-agent.ts` | `python_agents/agents/safety_agent.py` |
| `server/agents/evaluation-agent.ts` | `python_agents/agents/evaluation_agent.py` |
| `server/agents/database-agent.ts` | `python_agents/agents/database_agent.py` |
| `server/plugins/logging-plugin.ts` | `python_agents/plugins/logging_plugin.py` |
| `server/services/artifact-service.ts` | `python_agents/services/artifact_service.py` |
| `server/storage.ts` | `python_agents/services/storage.py` |
| `server/services/snapchat.ts` | `python_agents/services/snapchat.py` |
| `server/services/gemini.ts` | `python_agents/services/gemini.py` |
| `server/logger.ts` | `python_agents/logger.py` |

## Key Differences

### 1. Agent Base Class

**TypeScript:**
```typescript
import { Agent } from "@google/generative-ai-agents";

export class MyAgent extends Agent {
  async run(param: number) {
    // implementation
  }
}
```

**Python:**
```python
from agents.base_agent import Agent

class MyAgent(Agent):
    async def run(self, param: int):
        # implementation
```

### 2. Artifact Handling

**TypeScript:**
```typescript
const artifact = await artifactService.create({
  name: `data-${id}`,
  content: Buffer.from(JSON.stringify(data)),
  mimeType: "application/json",
});
```

**Python:**
```python
artifact = await artifact_service.create(
    name=f"data-{id}",
    content=json.dumps(data).encode('utf-8'),
    mime_type="application/json"
)
```

### 3. Error Handling

**TypeScript (Before - Missing):**
```typescript
const snapchatData = JSON.parse(snapchatDataArtifact.content.toString());
```

**Python (After - With Error Handling):**
```python
try:
    snapchat_data = json.loads(snapchat_data_artifact.content.decode('utf-8'))
except (json.JSONDecodeError, UnicodeDecodeError) as error:
    print(f"Failed to parse artifact - {error}")
    raise ValueError(f"Invalid data format: {error}")
```

### 4. Agent Instantiation

**TypeScript (Before - Inefficient):**
```typescript
async run(userId: number) {
  const data = await new SnapchatDataFetcherAgent().run(userId);
  const insights = await new DataAnalysisAgent().run(data);
}
```

**Python (After - Efficient):**
```python
def __init__(self):
    super().__init__()
    self.snapchat_fetcher = SnapchatDataFetcherAgent()
    self.data_analyzer = DataAnalysisAgent()

async def run(self, user_id: int):
    data = await self.snapchat_fetcher.execute(user_id)
    insights = await self.data_analyzer.execute(data)
```

### 5. Plugin Usage

**TypeScript (Before - Only on Orchestrator):**
```typescript
export class OrchestratorAgent extends Agent {
  constructor() {
    super();
    this.addPlugin(new LoggingPlugin());
  }
}
```

**Python (After - On All Agents):**
```python
class OrchestratorAgent(Agent):
    def __init__(self):
        super().__init__()
        
        # Add logging to orchestrator
        self.add_plugin(LoggingPlugin())
        
        # Add logging to all sub-agents
        self.snapchat_fetcher = SnapchatDataFetcherAgent()
        self.snapchat_fetcher.add_plugin(LoggingPlugin())
        
        self.data_analyzer = DataAnalysisAgent()
        self.data_analyzer.add_plugin(LoggingPlugin())
        # ... etc
```

## Step-by-Step Migration

### Step 1: Install Python Dependencies

```bash
cd python_agents
pip install -r requirements.txt
```

### Step 2: Test the Python Implementation

```bash
python3 example.py
```

This will run all agents and verify they work correctly.

### Step 3: Integrate with Your Application

#### Option A: Replace TypeScript Agents Entirely

1. Update your job scheduler to call Python agents:

```typescript
// server/services/job-scheduler.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runPythonAgent(userId: number) {
  const { stdout, stderr } = await execAsync(
    `python3 python_agents/run_orchestrator.py ${userId}`
  );
  return JSON.parse(stdout);
}
```

2. Create a Python script to run the orchestrator:

```python
# python_agents/run_orchestrator.py
import sys
import asyncio
import json
from agents.orchestrator_agent import OrchestratorAgent

async def main():
    user_id = int(sys.argv[1])
    orchestrator = OrchestratorAgent()
    result = await orchestrator.execute(user_id)
    print(json.dumps(result))

if __name__ == "__main__":
    asyncio.run(main())
```

#### Option B: Run Both in Parallel (Gradual Migration)

Keep both implementations and gradually migrate endpoints:

```typescript
// server/routes.ts
app.post("/api/refresh-data", async (req, res) => {
  const usePython = process.env.USE_PYTHON_AGENTS === 'true';
  
  if (usePython) {
    // Use Python implementation
    const result = await runPythonAgent(req.user.id);
    res.json(result);
  } else {
    // Use TypeScript implementation
    const orchestrator = new OrchestratorAgent();
    const result = await orchestrator.run(req.user.id);
    res.json(result);
  }
});
```

### Step 4: Update Database Integration

Replace the mock `StorageService` with your actual database:

```python
# python_agents/services/storage.py
import asyncpg

class StorageService:
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.pool = None
    
    async def init_pool(self):
        self.pool = await asyncpg.create_pool(self.db_url)
    
    async def get_user(self, user_id: int):
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM users WHERE id = $1", user_id
            )
            return User(**row) if row else None
```

### Step 5: Update API Integration

Replace mock Snapchat API calls with actual API integration:

```python
# python_agents/services/snapchat.py
import aiohttp

async def fetch_snapchat_data(client_id: str, api_key: str):
    async with aiohttp.ClientSession() as session:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        async with session.get(
            f"https://api.snapchat.com/v1/me?client_id={client_id}",
            headers=headers
        ) as response:
            if response.status != 200:
                raise ValueError(f"Snapchat API error: {response.status}")
            return await response.json()
```

## Testing

### Unit Tests

Create unit tests for each agent:

```python
# tests/test_agents.py
import pytest
from agents.test_agent import TestAgent

@pytest.mark.asyncio
async def test_test_agent_validates_data():
    agent = TestAgent()
    
    # Valid data should pass
    valid_data = {"totalFollowers": 1000}
    assert await agent.run(valid_data, "Some insights")
    
    # Invalid data should raise error
    invalid_data = {}
    with pytest.raises(ValueError):
        await agent.run(invalid_data, "Some insights")
```

### Integration Tests

Test the complete workflow:

```python
# tests/test_integration.py
import pytest
from agents.orchestrator_agent import OrchestratorAgent
from services.storage import storage, User

@pytest.mark.asyncio
async def test_complete_workflow():
    # Setup test user
    user = User(id=1, username="test", 
                snapchat_client_id="test", 
                snapchat_api_key="test")
    storage._users[1] = user
    
    # Run workflow
    orchestrator = OrchestratorAgent()
    result = await orchestrator.execute(user_id=1)
    
    # Verify results
    assert "snapchatData" in result
    assert "insights" in result
    assert result["snapchatData"]["totalFollowers"] > 0
```

## Rollback Plan

If you need to rollback to TypeScript:

1. Set `USE_PYTHON_AGENTS=false` in your environment
2. Restart your application
3. The TypeScript agents will be used instead

## Performance Considerations

Python agent performance is comparable to TypeScript:

- **Cold Start**: Slightly slower due to Python interpreter startup
- **Warm Execution**: Similar performance once loaded
- **Memory Usage**: Similar to TypeScript
- **Async I/O**: Python's asyncio is as efficient as Node.js

## Troubleshooting

### Import Errors

If you get import errors:
```bash
export PYTHONPATH="${PYTHONPATH}:/workspace/python_agents"
```

### Async Runtime Errors

Make sure to use `asyncio.run()` for top-level execution:
```python
if __name__ == "__main__":
    asyncio.run(main())
```

### Type Errors

Install type checking tools:
```bash
pip install mypy
mypy python_agents/
```

## Support

For issues or questions:
1. Check the README.md for usage examples
2. Run the example.py script to verify setup
3. Review the TypeScript implementation for comparison
4. Create an issue in the repository

## Summary

The Python implementation provides:
- ✅ All missing imports fixed
- ✅ Proper error handling throughout
- ✅ Efficient agent instantiation
- ✅ Complete logging coverage
- ✅ Type safety with Python type hints
- ✅ Better code organization
- ✅ Comprehensive documentation
- ✅ Working examples and tests

The migration is straightforward and can be done incrementally or all at once.
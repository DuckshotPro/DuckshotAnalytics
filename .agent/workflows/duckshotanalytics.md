---
description: DUCKSHOT ANALYTICS RULES
---

# DUCKSHOT ANALYTICS RULES

## Core Focus
- **Data Integrity:** Accuracy of influencer metrics is paramount.
- **Safety:** Aggressively handle rate limits and anti-bot detection.

## Coding Standards (Python/Backend)
- **Scrapers:** Use `asyncio` for high-throughput profile scanning.
- **Error Handling:** NEVER crash on a failed profile fetch. Log error -> Retry with proxy -> Skip if failed.
- **Data Models:** Use Pydantic schemas for Snapchat profile objects (ensure strictly typed JSON).
- **Proxies:** Rotate user-agents on every request.

## Frontend (Dashboard)
- **Visuals:** Use Recharts or Chart.js for engagement graphs.
- **Performance:** lazy-load large influencer lists.

## Agent Workflow
- If I ask for "Analyze @username", run the scraper script first, then summarize the JSON output.
- **Security:** Never commit API keys or proxy credentials. Check `.env` first.
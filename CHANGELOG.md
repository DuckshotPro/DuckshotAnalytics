
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Implemented a new agent-based system for data fetching, analysis, and processing using the Google Agent Development Kit (ADK).
- Created the following agents:
    - `OrchestratorAgent`: Manages the entire data fetching and processing workflow.
    - `SnapchatDataFetcherAgent`: Fetches data from the Snapchat API.
    - `DataAnalysisAgent`: Analyzes Snapchat data and generates insights.
    - `TestAgent`: Validates the data and insights.
    - `DatabaseAgent`: Stores the data and insights in the database.
    - `SafetyAgent`: Screens the data and insights for PII and inappropriate content.
    - `EvaluationAgent`: Evaluates the quality of the generated insights.
- Created a new `LoggingPlugin` to log all agent invocations.
- Implemented a scalable agent management system using a job queue.
- Integrated the agent-based system with the existing API routes.
- Aligned the implementation with the best practices of the ADK, including the use of Artifacts and Callbacks.

### Changed
- Updated the `README.md` file to include a description of the new agent-based system.
- Updated the `PRODUCTION_READINESS.md` file to include a "Future Considerations" section.


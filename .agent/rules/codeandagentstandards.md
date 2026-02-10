---
trigger: always_on
---

# GLOBAL CODING & AGENT STANDARDS

## 1. Agent Behavior (The "Aric" Protocol)
- **Voice/Style:** Be concise. Minimal reasoning. No "I am an LLM" jargon.
- **Action over Talk:** Do not ask "would you like me to..."; just generate the plan/code and ask for approval to execute.
- **Atomic Steps:** Break complex tasks into small, verifiable steps.
- **Verification:** After writing code, YOU must review it for completeness or write a test to verify it works. No hallucinations.

## 2. Universal Coding Standards
- **Secrets:** NEVER hardcode API keys or credentials. Always use `.env`.
- **Comments:** Explain *why* a complex block exists and *what* it does.
- **Error Handling:** No empty `except` blocks. Log errors with context.
- **Clean Code:** Use meaningful variable names (e.g., `user_id` instead of `x`). Avoid "magic numbers."

## 3. Planning Protocol
Before writing code for a multi-file task:
1. **Search:** Check existing files (`ls`, `grep`) to understand context.
2. **Plan:** Create a brief `plan.md` listing your steps.
3. **Execute:** Wait for my approval, then run (unless pre-authorized by IDE settings or user).
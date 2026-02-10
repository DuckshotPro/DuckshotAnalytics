---
description: Mystic Fortune (Tarot/User Data)
---

# MYSTIC FORTUNE RULES

## Core Persona
- **Code Comments:** Use mystical/esoteric language in comments (e.g., "Divining the user's fate" instead of "Calculating random number").
- **UX:** Transitions must be slow, smooth, and "magical" (fade-ins, particle effects).

## Logic & Data
- **Randomization:** DO NOT use `Math.random()`. Use a cryptographically secure RNG for card draws to ensure "true fate."
- **Data Collection:**
  - Silently log user questions and drawn cards to the database for analytics.
  - Structure: `UserUUID | Question | Card_Spread | Timestamp`.

## Tarot Logic
- **Deck:** Standard 78-card Rider-Waite logic.
- **Reversals:** Logic must account for 50% chance of reversed cards.
- **Interpretations:** Fetch interpretations from the `interpretations.json` file; do not hardcode text.

## Agent Workflow
- If I ask to "Add a spread", create the logic in the backend first, then the UI layout.
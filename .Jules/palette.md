# Palette's Journal

## 2024-05-23 - Accessibility of Hidden Forms
**Learning:** When multiple forms (Login/Register) exist on the same page but are toggled via visibility, screen readers and automation tools can struggle to distinguish them if they share generic selectors.
**Action:** Always scope selectors to the visible container or use specific text/aria-labels that distinguish the context (e.g., "Create account" button vs "Sign in" button).

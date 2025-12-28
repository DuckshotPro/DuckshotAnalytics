## 2024-05-23 - [Password Visibility Toggle]
**Learning:** Adding a show/hide password toggle significantly improves usability, especially on mobile devices where typing complex passwords is error-prone. Reusing the existing `Input` component while adding the toggle functionality requires careful positioning (absolute) to ensure it doesn't overlap with text.
**Action:** When creating form inputs for sensitive data, always consider if visibility toggles would help reduce user error. Use a wrapper component pattern to keep the base `Input` clean while extending functionality.

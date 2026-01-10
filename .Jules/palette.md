## 2026-01-02 - Accessible Skip Link & Decorative SVGs
**Learning:** Added a skip-to-content link, a critical yet often overlooked a11y feature. It is hidden until focused, respecting the design while empowering keyboard users. Also marked purely decorative SVGs with `aria-hidden="true"` to reduce screen reader noise.
**Action:** Always check for a main content skip mechanism in new projects and ensure purely decorative icons are hidden from AT.

## 2026-01-10 - Consistent Loading States & Radix Slots
**Learning:** Adding an `isLoading` prop to the base `Button` component simplifies usage across the app. However, when using Radix UI's `Slot` (via `asChild`), we cannot inject sibling elements like a spinner because `Slot` expects a single child. The solution is to conditionally render the loader only when `asChild` is false.
**Action:** When enhancing Radix primitives, always test the `asChild` composition pattern to ensure no runtime errors occur.

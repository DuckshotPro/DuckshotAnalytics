## 2026-01-02 - Accessible Skip Link & Decorative SVGs
**Learning:** Added a skip-to-content link, a critical yet often overlooked a11y feature. It is hidden until focused, respecting the design while empowering keyboard users. Also marked purely decorative SVGs with `aria-hidden="true"` to reduce screen reader noise.
**Action:** Always check for a main content skip mechanism in new projects and ensure purely decorative icons are hidden from AT.

## 2026-01-02 - Built-in Loading States
**Learning:** Adding `isLoading` prop directly to the base `Button` component simplifies the implementation of feedback states across the app and ensures consistent spinner usage (same icon, animation, and placement).
**Action:** When auditing UI components, look for repetitive patterns like conditional spinner rendering and move them into the core component.

## 2026-01-02 - Radix Slot & React.Children.only
**Learning:** When using Radix UI `Slot` (via `asChild`), the component must return exactly one React element. Conditional rendering that returns `null` or `false` alongside children (e.g. `{false} {children}`) creates an array, causing a runtime error.
**Action:** Guard conditional rendering in `asChild` components to ensure only the child is passed to `Slot`, or avoid injecting extra elements when `asChild` is true.
## 2026-01-16 - Radix Slot & Conditional Children
**Learning:** Radix UI's `Slot` component (used via `asChild`) is strictly single-child. Conditional rendering patterns like `{condition && <Icon />}` or `{condition ? <><Icon />{children}</> : children}` must be carefully structured. Specifically, simple short-circuiting `{condition && <A />}{children}` can return an array `[false, children]`, causing `React.Children.only` to crash.
**Action:** When using `asChild`, ensure conditional children are wrapped or structured so that exactly one React Element is returned to the Slot.

## 2026-05-22 - Trend Indicators & Screen Readers
**Learning:** Visual trend indicators (arrows + color) are insufficient for screen readers. `StatCard` displayed percentage change without indicating "increase" or "decrease" in text.
**Action:** Always append `sr-only` text (e.g., "Increased by") to trend indicators and hide decorative icons with `aria-hidden="true"`.

## 2026-02-02 - PasswordInput Standardization
**Learning:** `AuthPage` had a broken manual implementation of password toggling. Using the existing `PasswordInput` component not only fixed the bug but ensures consistent behavior (Eye/EyeOff icon usage) and accessibility across the app.
**Action:** Always check for existing form components (like `PasswordInput`, `DateInput`) before implementing custom form controls.

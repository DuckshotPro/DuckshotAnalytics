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

## 2026-06-15 - Empty States Strategy
**Learning:** When adding empty states to data tables, replacing the entire table (including headers) with the empty state is often better than keeping empty headers. It reduces clutter and allows for a more focused, helpful message and action.
**Action:** For tables with no data, conditionally render a dedicated empty state component instead of an empty table body.

## 2026-06-16 - Semantic Triggers for Dropdowns
**Learning:** Found `DropdownMenuTrigger` wrapping a `div` element. While `cursor-pointer` mimics interactivity visually, it fails for keyboard users. Radix UI's `asChild` prop requires the child to be a functional button to receive keyboard events and ARIA attributes correctly.
**Action:** Replace `div` wrappers with semantic `<Button>` components (using `variant="ghost"` for styling) inside accessible triggers.

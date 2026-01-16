## 2026-01-02 - Accessible Skip Link & Decorative SVGs
**Learning:** Added a skip-to-content link, a critical yet often overlooked a11y feature. It is hidden until focused, respecting the design while empowering keyboard users. Also marked purely decorative SVGs with `aria-hidden="true"` to reduce screen reader noise.
**Action:** Always check for a main content skip mechanism in new projects and ensure purely decorative icons are hidden from AT.

## 2026-01-16 - Radix Slot & Conditional Children
**Learning:** Radix UI's `Slot` component (used via `asChild`) is strictly single-child. Conditional rendering patterns like `{condition && <Icon />}` or `{condition ? <><Icon />{children}</> : children}` must be carefully structured. Specifically, simple short-circuiting `{condition && <A />}{children}` can return an array `[false, children]`, causing `React.Children.only` to crash.
**Action:** When using `asChild`, ensure conditional children are wrapped or structured so that exactly one React Element is returned to the Slot.

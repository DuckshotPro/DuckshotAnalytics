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

## 2026-01-21 - Button Polymorphism Bug
**Learning:** The `Button` component implemented the logic for `asChild` (determining `Comp`) but failed to use `Comp` in the return statement, rendering a hardcoded `<button>` instead. This silently broke polymorphism and caused TypeScript errors due to mismatched tags.
**Action:** Always verify that components supporting `asChild` actually render the dynamic component variable (e.g., `<Comp>`) rather than a static HTML tag.

## 2026-01-21 - Manual Form Accessibility
**Learning:** Forms using `react-hook-form` without the Shadcn `Form` wrapper components do not automatically get accessibility attributes. `aria-invalid` and `aria-describedby` must be manually added to inputs and linked to error message IDs.
**Action:** When auditing forms, check for manual `register` calls and ensure corresponding ARIA attributes are explicitly defined.

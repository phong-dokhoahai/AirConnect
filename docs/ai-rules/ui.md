# UI Rules

## Purpose

Maintain a single, consistent UI system across the entire project.

Never duplicate UI patterns.

Always reuse and extend existing components.

---

# Component Priority

Before creating a new component, search in this order:

1. `components/ui`
2. `components/common`
3. `features/{feature}/components`

Only create a new component if no suitable component exists.

---
## Design System First

When implementing a UI:

- Inspect the project for existing components before writing code.
- Prefer extending an existing component over creating a new one.
- If the requested UI matches an existing pattern by at least 80%, reuse it.
- Only create a new component when no existing component can reasonably satisfy the requirement.

# Design System

`components/ui` is the project's design system.

Examples:

* Button
* Input
* Select
* Checkbox
* Radio
* Switch
* Badge
* Avatar
* Modal
* Dialog
* Card
* Tabs
* Skeleton
* Spinner
* Pagination

Never recreate these components.

---

# Common Components

`components/common` contains reusable business UI.

Examples:

* SearchBar
* EmptyState
* ErrorState
* PageHeader
* PageSection
* ConfirmDialog
* DataTable
* StatusBadge
* Price
* Rating
* UserAvatar

If the same pattern appears in multiple features, extract it into `components/common`.

---

# Feature Components

Feature-specific components belong inside:

```
features/{feature}/components
```

Example:

```
features/tour/components/TourCard.tsx
```

Do not move feature-specific UI into `components/common`.

---

# Refactoring Rule

Whenever editing existing UI:

* Look for duplicated JSX.
* Replace duplicated JSX with reusable components.
* Do not duplicate layouts.
* Do not duplicate Tailwind classes.
* Extract repeated patterns.

---

# Component Composition

Prefer composition.

Good:

```
<Card>
    <CardHeader />
    <CardBody />
    <CardFooter />
</Card>
```

Avoid giant components with hundreds of lines.

---

# Existing Components

Always prefer existing components.

Never write:

```
<button />
```

Use:

```
<Button />
```

---

Never write:

```
<input />
```

Use:

```
<Input />
```

---

Never write:

```
<select />
```

Use:

```
<Select />
```

---

Never write duplicated card markup.

Extract:

```
<Card />
```

---

# Styling

Use Tailwind.

Never duplicate long className strings.

If the same styling appears multiple times, extract a reusable component.

---

# Props

Keep component APIs simple.

Prefer

```
<Button variant="primary" />
```

instead of

```
<Button
    background="#00A86B"
    color="#FFF"
    radius={8}
    ...
/>
```

---

# Variants

Use variants instead of creating multiple similar components.

Correct:

```
<Button variant="primary" />
<Button variant="secondary" />
<Button variant="outline" />
```

Incorrect:

```
PrimaryButton
SecondaryButton
OutlineButton
```

---

# Icons

Use the project's icon library.

Do not introduce another icon library.

---

# Responsiveness

Every component should work on:

* Mobile
* Tablet
* Desktop

Avoid fixed widths.

---

# Accessibility

Every interactive component should support:

* keyboard navigation
* aria-label when needed
* disabled state
* loading state
* focus state

---

# Performance

Avoid unnecessary re-renders.

Avoid inline object literals when reusable.

Memoize only when profiling indicates benefit.

---

# AI Refactoring Workflow

Before writing any JSX:

Step 1

Search:

* components/ui
* components/common

Step 2

Reuse existing components.

Step 3

If a component is missing but reusable:

Create it.

Step 4

Replace duplicated JSX.

Step 5

Verify that no existing component has been duplicated.

---

# Final Rule

The project should evolve toward fewer reusable components,
not more duplicated components.

Every refactor should reduce duplication.

Never increase duplication.

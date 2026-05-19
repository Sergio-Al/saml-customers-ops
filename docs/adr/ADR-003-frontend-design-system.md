# ADR-003: Frontend Design System — Custom Tailwind Tokens over Third-Party Component Library

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: Platform engineering

## Context

Phase 2 establishes the visual foundation of the platform.
The first decision is whether to adopt an existing component library or build on top of Tailwind CSS with a custom token system.

The platform has an explicit visual identity defined in `design.md`:

- dark neutral surfaces (`#0B0D10` canvas, `#111418` panels),
- operational state colors (AI, event, success, warning, error, trace),
- infrastructure-tooling aesthetic (closer to Datadog / Grafana than a generic SaaS dashboard),
- bento grid layout system with named tile sizes.

This identity is not achievable with zero customisation from a third-party library.

## Options Considered

### 1. shadcn/ui

- Pros: copy-paste components, Radix primitives, accessible, popular.
- Cons: opinionated default aesthetic (neutral/slate); dark mode is a toggle on a light-first system; difficult to express the bento tile sizing contract and operational color semantics cleanly; each component update is a manual copy.

### 2. Mantine / Radix Themes

- Pros: full component coverage, good TypeScript support.
- Cons: CSS variable override system fights Tailwind; theming for operational state colors (`ai`, `event`, `trace`) requires wrapping every token; bundle includes all components even if unused.

### 3. MUI (Material UI)

- Pros: mature, accessible, extensive.
- Cons: Material Design aesthetic is incompatible with the operational/infrastructure visual direction; heavy bundle; significant friction to achieve the required design language.

### 4. Custom `@ai-ops/ui` package on top of Tailwind (chosen)

- Pros:
  - design tokens are the single source of truth in `tailwind-preset.cjs` and `design.md`,
  - every component (`Tile`, `Sidebar`, `Badge`, `StatTile`) is authored to the exact spec,
  - no visual debt to clear before the design feels right,
  - bento grid contract (tile sizes, grid spans, pulse animations) is a first-class concept,
  - framer-motion integration is natural; no conflict with a library's internal animation system,
  - bundle includes only what is used.
- Cons:
  - more initial authoring work,
  - no built-in accessibility primitives (must be added per component as needed),
  - relies on team discipline to keep `design.md` and `tailwind-preset.cjs` in sync.

## Decision

Use **`@ai-ops/ui` with custom Tailwind design tokens**.

The token system is defined in two places that must stay in sync:

| Location                          | Role                                                                     |
| --------------------------------- | ------------------------------------------------------------------------ |
| `.github/skills/design.md`        | Human-readable source of truth (colors, typography, bento grid contract) |
| `packages/ui/tailwind-preset.cjs` | Machine-readable token definitions consumed by all apps                  |

All frontend apps extend from the preset via `tailwind.config.ts`:

```ts
import preset from "@ai-ops/ui/tailwind-preset";
export default { presets: [preset], content: [...] };
```

### Token naming

Tailwind custom colors follow the pattern in `design.md`:

- surfaces: `bg-canvas`, `bg-panel`, `bg-elevated`
- borders: `border-border-op`, `border-hairline`
- text: `text-text-primary`, `text-text-secondary`, `text-text-tertiary`, `text-text-muted`
- operational: `bg-ai`, `text-event`, `text-success`, `text-warning`, `text-error`, `text-trace`

No third-party component library is installed in Phase 2.
Radix UI primitives (for accessible dialogs, dropdowns, tooltips) may be added
in Phase 3+ on a per-component basis as needed, without adopting a full library.

## Consequences

- The `@ai-ops/ui` package is the canonical source of all shared UI components.
  No app should define its own design primitives.
- New components added to `packages/ui` must use design tokens from the preset,
  never hardcoded hex values or generic Tailwind slate/gray classes.
- `design.md` must be updated before adding new token names to the preset.
- Accessibility (ARIA, keyboard navigation) is the responsibility of the implementing
  engineer per component, since no Radix/Headless UI baseline is assumed.

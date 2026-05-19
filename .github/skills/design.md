# DESIGN.md

# AI Operations Platform Design System

---

# Overview

The platform treats operational visibility as the primary design language.

Interfaces are structured around:

- realtime orchestration,
- distributed system state,
- AI execution visibility,
- workflow intelligence,
- and editorial clarity.

The visual system combines:

- infrastructure tooling density,
- cinematic restraint,
- and operational telemetry surfaces.

Color is reserved primarily for:

- system state,
- execution feedback,
- and workflow visibility.

Most interfaces sit on dark neutral surfaces with restrained contrast, allowing:

- traces,
- event streams,
- workflow states,
- AI execution indicators,
- and orchestration timelines
  to become the dominant visual signals.

The system avoids:

- decorative gradients,
- excessive glow,
- glassmorphism,
- and consumer-oriented AI aesthetics.

Instead, the platform should feel:

- operational,
- structured,
- precise,
- realtime,
- and infrastructure-native.

The design language positions the product closer to:

- observability platforms,
- orchestration tooling,
- and cloud-native operational systems
  than traditional SaaS dashboards.

---

# Design Principles

## Operational First

Interfaces should communicate:

- system state,
- execution progress,
- workflow health,
- and distributed visibility
  before marketing aesthetics.

The UI should feel like:

> an operational control plane for AI-native systems.

---

## Editorial Restraint

The platform uses:

- restrained typography,
- disciplined spacing,
- minimal color usage,
- and clean layout hierarchy.

Visual noise is avoided intentionally.

---

## Realtime Interfaces

The platform should feel operationally alive.

Realtime systems are visible through:

- streaming events,
- execution timelines,
- distributed traces,
- workflow transitions,
- and live orchestration updates.

Motion exists to communicate:

- state,
- causality,
- and execution flow.

Never decoration.

---

## Infrastructure Aesthetic

The visual direction should resemble:

- observability tooling,
- cloud infrastructure platforms,
- workflow orchestration systems,
- and engineering dashboards.

NOT:

- crypto dashboards,
- futuristic neon AI products,
- or generic SaaS marketing sites.

---

# Colors

## Core Surfaces

| Token               | Value     | Usage                              |
| ------------------- | --------- | ---------------------------------- |
| `{colors.canvas}`   | `#0B0D10` | Main application background        |
| `{colors.panel}`    | `#111418` | Primary cards and panels           |
| `{colors.elevated}` | `#171B21` | Active operational surfaces        |
| `{colors.border}`   | `#242933` | Card borders and separators        |
| `{colors.hairline}` | `#2F3541` | Fine dividers and subtle structure |

---

## Typography Colors

| Token                     | Value     | Usage                           |
| ------------------------- | --------- | ------------------------------- |
| `{colors.text.primary}`   | `#F5F7FA` | Main headings and high emphasis |
| `{colors.text.secondary}` | `#A6B0BF` | Secondary body content          |
| `{colors.text.tertiary}`  | `#738093` | Metadata and low-priority UI    |
| `{colors.text.muted}`     | `#5B6472` | Disabled and subtle content     |

---

## Operational State Colors

Color should indicate:

- system state,
- orchestration status,
- or execution feedback.

Never decoration.

| Token              | Value     | Usage                          |
| ------------------ | --------- | ------------------------------ |
| `{colors.ai}`      | `#7C8CFF` | AI workflows and agent actions |
| `{colors.event}`   | `#4DA3FF` | Event-stream indicators        |
| `{colors.success}` | `#3FB950` | Successful execution states    |
| `{colors.warning}` | `#D29922` | Retry or pending operations    |
| `{colors.error}`   | `#F85149` | Failed executions              |
| `{colors.trace}`   | `#A371F7` | Distributed tracing visuals    |

---

# Typography

## Font Pairing

### Primary UI Font

**Inter**

Used for:

- dashboard interfaces,
- forms,
- tables,
- operational surfaces,
- navigation,
- telemetry panels.

Why:

- excellent readability,
- infrastructure-product feel,
- modern cloud-native aesthetic,
- scalable interface density.

---

### Display Font

**Geist**

Used for:

- hero statements,
- platform positioning,
- section headers,
- operational metrics,
- landing page headlines.

The display layer should feel:

- calm,
- precise,
- architectural,
- and technical.

---

### Monospace Font

**JetBrains Mono**

Reserved for:

- correlation IDs,
- traces,
- workflow execution logs,
- event payload previews,
- infrastructure metadata.

Monospace should appear intentionally and sparingly.

---

# Icons

## Library

**Lucide React** (`lucide-react`)

The sole icon library for this platform.

Why:

- clean 1.5px stroke geometry — matches the platform's structured, precise aesthetic,
- tree-shakeable (only imported icons are bundled),
- TypeScript-first with full type support,
- used by Linear, Vercel, and modern infrastructure tooling — consistent with the design direction.

---

## Usage Rules

Icons are **functional signals**, not decoration.

Use icons to:

- identify navigation destinations in the sidebar,
- label tile headers to distinguish content type at a glance,
- communicate state changes in operational indicators.

Never use icons:

- as decorative fills,
- alongside text that already communicates the same information redundantly,
- at sizes above 16px in dense operational surfaces.

---

## Size Scale

| Context             | Size |
| ------------------- | ---- |
| Tile header         | 13px |
| Sidebar nav item    | 14px |
| Inline state dot    | 12px |
| Action button label | 14px |

---

## Stroke & Color

- Stroke width: `1.5` (Lucide default — do not override)
- Color: inherit from parent text color (`text-text-tertiary` in tile headers, `text-text-secondary` in nav)
- Never apply operational state colors (`ai`, `event`, `error`, etc.) to icons directly — use badges or dots for state

---

## Canonical Icon Map

| Surface             | Icon              | Lucide name       |
| ------------------- | ----------------- | ----------------- |
| Dashboard nav       | Grid layout       | `LayoutDashboard` |
| Events nav          | Live signal       | `Radio`           |
| Workflows nav       | Branch graph      | `GitFork`         |
| Settings nav        | Gear              | `Settings`        |
| Event Timeline tile | Activity waveform | `Activity`        |
| AI Status tile      | Agent bot         | `Bot`             |
| Workflow Graph tile | Fork              | `GitFork`         |
| Top Events tile     | Bar chart         | `BarChart2`       |
| Distributed Trace   | Merge graph       | `GitMerge`        |

---

# Typography Hierarchy

| Token                      | Size | Weight | Tracking | Usage                    |
| -------------------------- | ---- | ------ | -------- | ------------------------ |
| `{typography.display-xl}`  | 64px | 600    | -2px     | Landing hero statements  |
| `{typography.display}`     | 48px | 600    | -1.5px   | Section-level headlines  |
| `{typography.heading-lg}`  | 32px | 600    | -1px     | Operational sections     |
| `{typography.heading-md}`  | 24px | 600    | -0.5px   | Dashboard cards          |
| `{typography.heading-sm}`  | 18px | 600    | 0        | Widget titles            |
| `{typography.body}`        | 15px | 400    | 0        | Default interface text   |
| `{typography.body-strong}` | 15px | 600    | 0        | Emphasized content       |
| `{typography.meta}`        | 13px | 500    | 0        | Metadata and telemetry   |
| `{typography.mono}`        | 12px | 500    | 0        | Correlation IDs and logs |

---

# Layout

## Layout Philosophy

The layout system should feel:

- structured,
- stable,
- operational,
- and scalable.

Interfaces prioritize:

- readability,
- workflow visibility,
- and execution hierarchy.

---

## Grid System

### Application Layout

```text
Sidebar
→ Main Operational Workspace
→ Context / Telemetry Panel
```

The layout resembles:

- observability tooling,
- orchestration systems,
- and realtime operations dashboards.

---

## Spacing Scale

| Token               | Value |
| ------------------- | ----- |
| `{spacing.xs}`      | 4px   |
| `{spacing.sm}`      | 8px   |
| `{spacing.md}`      | 16px  |
| `{spacing.lg}`      | 24px  |
| `{spacing.xl}`      | 32px  |
| `{spacing.section}` | 64px  |

---

## Container Philosophy

Operational panels should:

- align to grids,
- preserve consistent spacing,
- and avoid floating-card chaos.

Whitespace should communicate:

- hierarchy,
- structure,
- and workflow grouping.

---

# Elevation & Depth

The platform avoids:

- heavy shadows,
- glow effects,
- and artificial depth.

Depth is communicated through:

- tonal surface changes,
- layering,
- and operational grouping.

---

# Elevation Levels

| Level    | Treatment         | Usage                        |
| -------- | ----------------- | ---------------------------- |
| Flat     | No shadow         | Default surfaces             |
| Elevated | Slight tonal lift | Active workflows             |
| Focused  | Border emphasis   | Selected orchestration nodes |

---

# Motion

Motion communicates:

- execution,
- causality,
- and realtime state changes.

---

# Good Motion

- Event streaming
- Workflow execution
- Realtime graph updates
- Trace expansion
- Timeline transitions

---

# Avoid

- Decorative parallax
- Floating animations
- Unnecessary fades
- Excessive spring motion

---

# Components

## Operational Sidebar

Purpose:

- tenant navigation,
- workflow access,
- orchestration entrypoints,
- observability tools.

Characteristics:

- dense but readable,
- minimal icon usage,
- structured hierarchy.

---

## Event Timeline

The platform's signature component.

Visualizes:

- event ingestion,
- workflow execution,
- retries,
- AI operations,
- distributed traces,
- orchestration state.

Should feel:

- realtime,
- structured,
- and operationally alive.

---

## AI Execution Panel

Displays:

- tool execution,
- token streaming,
- retrieval context,
- agent decisions,
- workflow dispatches.

This is not a chatbot UI.

It is:

> operational AI visibility.

---

## Workflow Builder

Built using:

- node graphs,
- execution edges,
- orchestration visualization,
- distributed state indicators.

The workflow system should feel:

- industrial,
- precise,
- and scalable.

---

## Observability Surface

Includes:

- traces,
- metrics,
- event throughput,
- latency graphs,
- execution waterfalls.

The UI should resemble:

- modern cloud observability tooling.

---

# Shapes

| Token            | Value  | Usage                    |
| ---------------- | ------ | ------------------------ |
| `{rounded.none}` | 0px    | Dense operational tables |
| `{rounded.sm}`   | 6px    | Inputs and controls      |
| `{rounded.md}`   | 10px   | Cards and panels         |
| `{rounded.lg}`   | 16px   | Hero surfaces            |
| `{rounded.full}` | 9999px | Status pills             |

---

# Buttons

## Primary Action

- Background `{colors.text.primary}`
- Text `{colors.canvas}`
- Rounded `{rounded.md}`
- Weight `600`

Primary actions should feel:

- intentional,
- infrastructural,
- and restrained.

---

## Secondary Action

- Transparent background
- Border `{colors.border}`
- Text `{colors.text.secondary}`

---

# Visual Identity

The product identity should communicate:

```text
AI-native operational infrastructure.
```

NOT:

```text
consumer AI assistant.
```

The interface should feel:

- engineered,
- operational,
- distributed,
- and realtime.

---

# Inspiration

The design language draws inspiration from:

- Linear
- Vercel
- Datadog
- Grafana
- Temporal
- Retool
- modern observability tooling

while maintaining its own:

- architectural,
- cinematic,
- and infrastructure-oriented identity.

---

# Do's and Don'ts

## Do

- Use restrained neutral surfaces
- Prioritize operational clarity
- Use color only for state
- Build dense-but-readable interfaces
- Emphasize workflow visibility
- Design around realtime orchestration
- Keep motion purposeful

---

## Don't

- Don't use neon gradients
- Don't overuse glow effects
- Don't create consumer-style AI visuals
- Don't overload interfaces with decorative colors
- Don't use floating-card chaos
- Don't make the UI playful
- Don't imitate generic AI startup aesthetics

---

# Bento Grid

## Philosophy

The dashboard uses a bento grid as its primary layout system.

Bento grid is appropriate here because:

- operational dashboards have information at multiple density levels,
- some data is glanceable (metrics, statuses), some is detailed (event timelines, traces),
- asymmetric tiles communicate information hierarchy without relying on visual noise,
- the dark surface palette makes tile boundaries naturally legible.

The grid should feel:

- structured and intentional,
- operationally alive through tile-level realtime updates,
- not decorative — every tile size choice reflects the information weight of its content.

---

## Grid Contract

Base unit: `1` column = `1fr` of a **12-column** grid.
Row height unit: `80px` base row. Tiles span multiples of this unit.

| Size token  | Columns | Rows | Description                           |
| ----------- | ------- | ---- | ------------------------------------- |
| `tile-xs`   | 3       | 1    | Single metric or status indicator     |
| `tile-sm`   | 3       | 2    | Compact stat with trend or sparkline  |
| `tile-md`   | 4       | 2    | Widget with heading + body            |
| `tile-lg`   | 6       | 2    | Chart or summary panel                |
| `tile-xl`   | 6       | 3    | Rich panel (AI execution, trace view) |
| `tile-wide` | 8       | 2    | Horizontal timeline or activity feed  |
| `tile-full` | 12      | 3    | Event timeline, workflow graph        |

Gap between tiles: `{spacing.sm}` (8px).

---

## Dashboard Layout Map

The main operational dashboard (`/dashboard`) uses this tile arrangement:

```text
[ xs: Active Tenants ] [ xs: Events/min ] [ xs: AI Requests ] [ xs: Error Rate ]
[ wide: Event Timeline (live)                                ] [ sm: AI Status  ]
[ lg: Workflow Execution Graph                               ] [ md: Top Events ]
[ full: Distributed Trace Waterfall                                             ]
```

### Tile → Content mapping

| Tile               | Content                                          | Size        |
| ------------------ | ------------------------------------------------ | ----------- |
| Active Tenants     | Count + delta vs last hour                       | `tile-xs`   |
| Events / min       | Realtime throughput gauge                        | `tile-xs`   |
| AI Requests        | Count + latency p95                              | `tile-xs`   |
| Error Rate         | Percentage + trend arrow                         | `tile-xs`   |
| Event Timeline     | Live scrolling event feed with type badges       | `tile-wide` |
| AI Status          | Current agent state + last action                | `tile-sm`   |
| Workflow Execution | Node graph of in-flight workflows                | `tile-lg`   |
| Top Events         | Ranked event types by volume                     | `tile-md`   |
| Trace Waterfall    | Distributed trace spans for selected correlation | `tile-full` |

---

## Tile Anatomy

Every tile shares a common structure:

```text
┌─────────────────────────────────────┐
│ [Icon] Title             [badge/tag] │  ← header: {typography.meta}, {colors.text.tertiary}
├─────────────────────────────────────┤
│                                     │
│   Content area                      │  ← varies by tile type
│                                     │
├─────────────────────────────────────┤
│ Updated 3s ago          [action?]   │  ← footer (optional): {typography.mono}
└─────────────────────────────────────┘
```

Surface: `{colors.panel}` (`#111418`)
Border: `1px solid {colors.border}` (`#242933`)
Radius: `{rounded.md}` (10px)
Padding: `{spacing.md}` (16px)

Active / focused tile: surface lifts to `{colors.elevated}`, border changes to `{colors.hairline}`.

---

## Realtime Tile Behavior

Tiles that display live data follow this update contract:

- **Pulse on new data**: border briefly transitions to the relevant state color (`{colors.event}`, `{colors.ai}`, etc.) for 400ms, then returns to `{colors.border}`.
- **Counter increments**: animate with a subtle vertical slide-up (80ms, ease-out). No bounce.
- **Error state**: tile border becomes `{colors.error}` and persists until acknowledged.
- **Loading skeleton**: tiles render a muted shimmer (`{colors.elevated}` → `{colors.border}`) while data is fetching. No spinners inside tiles.

---

## Responsive Collapse

| Breakpoint    | Columns | Behaviour                                                                |
| ------------- | ------- | ------------------------------------------------------------------------ |
| `≥ 1440px`    | 12      | Full bento layout as defined                                             |
| `1024–1439px` | 8       | `tile-full` → 8col; `tile-wide` → 8col; others scale down proportionally |
| `768–1023px`  | 4       | All tiles collapse to 4col stacked; `tile-xs` tiles group into a 2×2 row |
| `< 768px`     | 1       | Single column; tiles stack vertically; bento layout disabled             |

Mobile (`< 768px`) is a monitoring view only — write operations are not supported at this breakpoint.

---

# Final Direction

The platform should visually communicate:

```text
This system orchestrates distributed AI workflows in realtime.
```

Every visual decision should reinforce:

- engineering maturity,
- infrastructure thinking,
- and operational intelligence.

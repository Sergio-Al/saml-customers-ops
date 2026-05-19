# Phase 2 — Frontend Platform Shell

## Goal

Build the frontend architecture BEFORE business features.
No backend required — mock data and auth stubs power everything until Phase 3 & 4.

---

## Phase 2A — Vite app scaffold `apps/dashboard-web` _(parallel with 2B)_

1. `package.json` — name `@ai-ops/dashboard-web`
   - deps: `react@18`, `react-dom`, `react-router-dom@6`, `zustand`, `@tanstack/react-query`, `@tanstack/react-virtual`, `recharts`
   - **Phase 2 libs** (install now, use in this phase):
     - `@xyflow/react` — workflow graph canvas (WorkflowGraphTile stub + Phase 6 full builder)
     - `cmdk` — command palette (`⌘K` global search across tenants, events, workflows)
     - `framer-motion` — tile entrance/pulse animations, sidebar transitions, event row entrances
     - `@tanstack/react-table` — events table in EventsPage, TopEventsTile ranked list
     - `react-json-view-lite` — event payload inspector in EventTimeline row expand
   - workspace deps: `@ai-ops/ui workspace:*`, `@ai-ops/shared-types workspace:*`, `@ai-ops/observability-sdk workspace:*`, `@ai-ops/event-sdk workspace:*`
   - devDeps: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, `@types/react`, `@types/react-dom`
   - scripts: `dev`, `build`, `lint`, `typecheck`

2. `vite.config.ts` — React plugin, path alias `@/*` → `./src/*`

3. `tsconfig.json` — extends `../../tsconfig.base.json`, adds `DOM` + `DOM.Iterable` lib, `jsx: react-jsx`, `paths: { "@/*": ["./src/*"] }`

4. `tailwind.config.ts` — content globs `["./index.html", "./src/**/*.{ts,tsx}"]`, preset from `@ai-ops/ui/tailwind-preset`

5. `postcss.config.cjs` — tailwindcss + autoprefixer

6. `index.html` — root `<div id="root">`, load Inter + Geist + JetBrains Mono via Fontsource (npm) or Google Fonts link

7. `src/main.tsx` — React 18 `createRoot`, wrap with `<Providers>`

---

## Phase 2B — Dark design system in `@ai-ops/ui` _(parallel with 2A)_

8. Update `packages/ui/tailwind-preset.cjs` — extend `theme.colors` with full design token palette:
   - surfaces: `canvas: "#0B0D10"`, `panel: "#111418"`, `elevated: "#171B21"`, `border-op: "#242933"`, `hairline: "#2F3541"`
   - text: `text-primary: "#F5F7FA"`, `text-secondary: "#A6B0BF"`, `text-tertiary: "#738093"`, `text-muted: "#5B6472"`
   - operational: `ai: "#7C8CFF"`, `event: "#4DA3FF"`, `success: "#3FB950"`, `warning: "#D29922"`, `error: "#F85149"`, `trace: "#A371F7"`

9. Update `packages/ui/src/Card.tsx` — replace `bg-white border-slate-200 shadow-sm` → `bg-panel border border-border-op text-text-primary`

10. Update `packages/ui/src/Badge.tsx` — replace light tones with design-system operational tones:
    - `neutral` → `bg-elevated text-text-secondary`
    - `success` → `bg-success/10 text-success`
    - `warning` → `bg-warning/10 text-warning`
    - `danger` → `bg-error/10 text-error`
    - `info` → `bg-event/10 text-event`
    - add new tone `"ai"` → `bg-ai/10 text-ai`

11. Add `packages/ui/src/Tile.tsx` — bento tile base component:
    - props: `size: "xs" | "sm" | "md" | "lg" | "xl" | "wide" | "full"`, `title`, `icon?`, `badge?`, `footer?`, `pulse?: boolean`, `children`
    - size → CSS classes map:
      - `xs`: `col-span-3 row-span-1`
      - `sm`: `col-span-3 row-span-2`
      - `md`: `col-span-4 row-span-2`
      - `lg`: `col-span-6 row-span-2`
      - `xl`: `col-span-6 row-span-3`
      - `wide`: `col-span-8 row-span-2`
      - `full`: `col-span-12 row-span-3`
    - surface: `bg-panel border border-border-op rounded-[10px] p-4 flex flex-col gap-2`
    - `pulse` variant: use `framer-motion` `<motion.div>` — `animate={{ borderColor: ["#4DA3FF", "#242933"] }}` over 400ms; replaces CSS keyframe approach
    - tile entrance: `<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}` with staggered delay per tile index
    - header: title in `text-text-tertiary text-[13px] font-medium`, badge slot right
    - footer: `text-[12px] font-mono text-text-muted` (optional)

12. Add `packages/ui/src/StatTile.tsx` — `tile-xs` stat card:
    - props: `label`, `value`, `delta?`, `deltaDirection?: "up" | "down" | "flat"`, `size?: "xs" | "sm"`
    - delta colors: up → `text-success`, down → `text-error`, flat → `text-text-muted`

13. Add `packages/ui/src/Sidebar.tsx`:
    - fixed 240px left, full height, `bg-panel border-r border-border-op`
    - logo slot at top
    - `NavItem` sub-component: icon + label, active state → `bg-elevated border-l-2 border-hairline text-text-primary`
    - tenant badge at bottom: tenant name + plan badge

14. Add `packages/ui/src/RealtimeBadge.tsx` — live connection indicator:
    - props: `connected: boolean`
    - connected: pulsing green dot (`bg-success animate-pulse`) + "Live" label in `text-[11px] text-text-tertiary font-mono`
    - disconnected: static gray dot + "Offline"

15. Export all from `packages/ui/src/index.ts`

---

## Phase 2C — Dashboard shell & routing _(depends on 2A+2B)_

16. `src/app/providers.tsx` — compose `QueryClientProvider` (TanStack Query) + `RouterProvider`

17. `src/app/router.tsx` — `createBrowserRouter`:
    - `/` → redirect to `/dashboard`
    - `/dashboard` → `<AppLayout>` + `<DashboardPage>`
    - `/events` → `<AppLayout>` + `<EventsPage>` (stub)
    - `/workflows` → `<AppLayout>` + `<WorkflowsPage>` (stub)
    - `/settings` → `<AppLayout>` + `<SettingsPage>` (stub)
    - `/login` → `<LoginPage>` (stub, Phase 3 wires real auth)

18. `src/layouts/AppLayout.tsx` — flex row: `<Sidebar>` (240px, shrink-0) + `<main>` (flex-1, `bg-canvas min-h-screen overflow-y-auto`)

19. `src/stores/auth.store.ts` — Zustand:

    ```ts
    interface AuthState {
      user: { id: string; name: string; email: string } | null;
      tenantId: string;
      role: "owner" | "admin" | "operator" | "analyst";
    }
    ```

    Hardcoded demo values. `useAuth()` export. Phase 3 replaces with real JWT.

20. `src/stores/tenant.store.ts` — Zustand `{ activeTenant: Tenant | null, setTenant }` typed against `@ai-ops/shared-types`

21. `src/guards/AuthGuard.tsx` — reads `useAuth()`; stub always renders children; Phase 3 adds redirect to `/login`

22. Stub pages: `src/pages/EventsPage.tsx`, `WorkflowsPage.tsx`, `SettingsPage.tsx`, `LoginPage.tsx` — each returns a centered "Phase N" placeholder

---

## Phase 2D — Bento grid & dashboard page _(depends on 2B+2C, parallel with 2E)_

23. `src/components/bento/BentoGrid.tsx`:

    ```tsx
    // CSS Grid: 12 cols, 80px base row, 8px gap
    // grid-cols-12 auto-rows-[80px] gap-2
    // Responsive:
    //   lg (1024px): grid-cols-8 — tile-full/wide cap at 8
    //   md (768px):  grid-cols-4 — all tiles collapse to col-span-4
    //   sm (<768px): grid-cols-1 — single column stack
    ```

24. `src/pages/DashboardPage.tsx` — assembles all tiles:

    ```
    Row 1:    [xs: ActiveTenants] [xs: EventsPerMin] [xs: AIRequests] [xs: ErrorRate]
    Row 2-3:  [wide: EventTimeline                              ] [sm: AIStatus]
    Row 4-5:  [lg: WorkflowGraph                    ] [md: TopEvents           ]
    Row 6-8:  [full: TraceWaterfall                                             ]
    ```

25. `src/tiles/AIStatusTile.tsx` — shows last event type received + "Agent idle" state with `ai` color dot; size `sm`

26. `src/tiles/WorkflowGraphTile.tsx` — empty `@xyflow/react` `<ReactFlow>` canvas with `<Background>` and `<Controls>` components, "Workflow Builder — Phase 6" centered overlay; size `lg`

27. `src/tiles/TopEventsTile.tsx` — ranked list of top 5 event types by mock count; size `md`; uses `useEventsStore` counts

28. `src/tiles/TraceWaterfallTile.tsx` — stub horizontal span bars (divs, mocked widths) labeled with service names; `trace` color; size `full`

---

## Phase 2E — Realtime infrastructure _(parallel with 2D)_

29. `src/lib/event-stream.ts` — `EventSource` wrapper:
    - `createEventStream(url: string, onEvent: (e: EventEnvelope) => void): () => void`
    - reconnect on error using `DEFAULT_RETRY_POLICY` from `@ai-ops/event-sdk` (exponential backoff)
    - returns cleanup function

30. `src/lib/mock-event-generator.ts`:
    - generates `EventEnvelope` via `createEventEnvelope` from `@ai-ops/event-sdk`
    - cycles through all 10 `EventType` values with random `tenantId` from a small set
    - interval: 1200ms default (configurable)
    - returns `start() → stop()` controller

31. `src/hooks/useEventStream.ts`:
    - if `import.meta.env.VITE_USE_MOCK_EVENTS === "true"` → uses mock generator
    - else → uses `createEventStream(VITE_API_URL + "/events/stream")`
    - calls `eventsStore.addEvent` on each received envelope
    - exposes `connected: boolean`

32. `src/stores/events.store.ts` — Zustand:

    ```ts
    interface EventsState {
      events: EventEnvelope[]; // capped at 200 (FIFO drop oldest)
      addEvent(e: EventEnvelope): void;
      clearEvents(): void;
      filterTypes: EventType[];
      setFilterTypes(types: EventType[]): void;
    }
    ```

33. `.env.development`:
    ```
    VITE_USE_MOCK_EVENTS=true
    VITE_API_URL=http://localhost:3000
    ```

---

## Phase 2F — Event Timeline tile — full implementation _(depends on 2D+2E)_

34. `src/tiles/EventTimelineTile.tsx`:
    - reads `eventsStore.events` and `eventsStore.filterTypes`
    - virtualized scroll via `@tanstack/react-virtual` (`useVirtualizer`) — handles 200+ rows without DOM thrash
    - **Row anatomy**: `[EventTypeBadge] [correlationId mono] [source] [Ns ago]`
    - **Badge tone map** (derived from EventType):
      - `ai.*` → tone `"ai"`
      - `customer.*` → tone `"info"` (event color)
      - `workflow.completed` → tone `"success"`
      - `workflow.failed` → tone `"danger"`
      - `workflow.started` → tone `"warning"`
      - `ticket.escalated` → tone `"danger"`
      - `payment.failed` → tone `"danger"`
      - `tenant.*` → tone `"warning"`
    - **Filter bar** (tile header area):
      - Multi-select event type chips (click to toggle); uses `@tanstack/react-table` column filter API for EventsPage consistency
      - correlationId text input (filters by prefix match)
    - **New event entrance**: `framer-motion` `<AnimatePresence>` wrapping each row; `initial={{ opacity: 0, x: -8 }}` → `animate={{ opacity: 1, x: 0 }}`; border-left `#4DA3FF` fades out over 400ms via `motion` animate
    - **Expand row**: click row → inline expand shows `<JSONTree>` from `react-json-view-lite` rendering `event.payload`; framer-motion height animation
    - **`<RealtimeBadge connected={connected} />`** in tile header right slot
    - **`cmdk` integration**: `⌘K` palette registered in `AppLayout` with a "Jump to correlation" action that focuses timeline and highlights matching rows
    - Size: `wide`

---

## Phase 2G — Turbo + CI verification _(no new files)_

- `apps/*` already covered by `pnpm-workspace.yaml`
- `turbo.json` `dev`/`build`/`lint`/`typecheck` tasks cascade to `dashboard-web` automatically
- `ci.yml` root `pnpm lint`, `pnpm typecheck`, `pnpm build` commands cascade via Turborepo — no changes needed

---

## Verification Checklist

- [ ] `pnpm install` — all deps resolve including new dashboard-web deps
- [ ] `pnpm turbo run build` — zero errors across all packages + dashboard-web
- [ ] `pnpm turbo run typecheck` — zero TS errors
- [ ] `pnpm turbo run lint` — zero warnings
- [ ] `pnpm dev` → dashboard-web at `http://localhost:5173`
- [ ] Bento grid renders with 9 tiles in correct layout
- [ ] Mock events flow into the Event Timeline tile at ~1200ms intervals
- [ ] New event rows animate in with event-color border pulse
- [ ] Filter chips hide/show rows by event type
- [ ] Resize to 1024px → 8-column collapse (wide/full tiles shrink, xs tiles reflow)
- [ ] Resize to 768px → 4-column, tiles stack
- [ ] CI green on push to main

---

## Key Decisions

| Decision            | Choice                                          | Rationale                                                                               |
| ------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| Backend in Phase 2  | None                                            | Phase 3 wires real auth; Phase 4 wires real events. Don't block UI on services.         |
| Dark theme approach | Tailwind custom colors via preset               | `bg-panel`, `text-text-secondary`, `border-border-op` — zero CSS variables, fully typed |
| ui package re-theme | Update Card + Badge now                         | They were light placeholders. Consistent design from day one.                           |
| Bento layout        | CSS Grid only                                   | `grid-cols-12 auto-rows-[80px]` + `col-span-*/row-span-*`. Zero deps, fully responsive. |
| Router              | React Router v6 `createBrowserRouter`           | Data router pattern, future-proof for loaders in Phase 3+                               |
| Virtualisation      | `@tanstack/react-virtual` in EventTimeline only | 200+ events would thrash the DOM without it                                             |
| Scope               | `dashboard-web` only                            | `workflow-builder-web` + `admin-console-web` stay `.gitkeep` until Phase 6              |
| Animation           | `framer-motion` (not CSS keyframes)             | Consistent motion API, `AnimatePresence` for list enter/exit, better operational feel   |
| Workflow canvas     | `@xyflow/react` (not `reactflow` v10)           | v12 package name, React 18 compatible, same API surface as Phase 6 full builder         |
| Tables              | `@tanstack/react-table`                         | Headless, consistent with react-query pattern; used in EventsPage + TopEventsTile       |
| Command palette     | `cmdk`                                          | Zero-style headless, styled to match dark design system; cross-phase feature            |
| Payload viewer      | `react-json-view-lite`                          | Lightweight, tree-view for event payloads in timeline row expand                        |

---

## Future Frontend Infrastructure

The following libraries are **not installed in Phase 2** but are pre-selected for upcoming phases. They are intentionally excluded from `dashboard-web/package.json` now to keep the Phase 2 bundle lean.

| Library                  | Phase     | Purpose                                                                  |
| ------------------------ | --------- | ------------------------------------------------------------------------ |
| `@monaco-editor/react`   | Phase 5–6 | Workflow definition editor, AI prompt editor, rule authoring             |
| `react-resizable-panels` | Phase 7   | Dockable observability layouts — split trace/log/metric panels           |
| `xterm`                  | Phase 7–8 | Realtime execution console — AI agent output streaming, workflow logs    |
| `@visx/visx`             | Phase 7   | Custom trace waterfall, latency distribution charts, AI execution graphs |

### Rationale

Libraries are selected based on:

- **operational UX quality** — they fit infrastructure-tooling aesthetics, not generic dashboard libraries
- **scalability** — headless or low-level APIs that can be styled precisely to the design system
- **infrastructure-tooling ergonomics** — the frontend should feel closer to Datadog / Grafana / Temporal than a generic SaaS dashboard

This prepares the architecture for:

- workflow orchestration UIs (`@xyflow/react` already in place)
- distributed trace visualization (`@visx/visx` + `react-resizable-panels`)
- AI execution graphs (`@visx/visx`)
- operational command palettes (`cmdk` already in place)
- dockable observability layouts (`react-resizable-panels`)
- realtime execution consoles (`xterm`)

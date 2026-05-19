# ADR-004: Frontend State Management — Zustand + TanStack Query

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: Platform engineering

## Context

The dashboard frontend manages several distinct categories of state:

1. **Server state** — tenant data, event history, workflow runs, AI agent status.
   This data is remote, async, paginated, and needs caching, background refetching,
   and invalidation.

2. **Client state** — active tenant context, authenticated user, UI state (sidebar
   open/closed, active filters, command palette open), realtime event buffer.
   This data is local, synchronous, and does not need to be fetched.

3. **Realtime state** — a live stream of `EventEnvelope` objects arriving via SSE.
   This needs to be pushed into a capped buffer and subscribed to by multiple tiles
   simultaneously.

Conflating these categories into a single state manager creates problems:
server data in a local store becomes stale; local UI state in a query cache is overkill.

## Options Considered

### 1. Redux Toolkit

- Pros: mature, excellent DevTools, well-understood patterns, large ecosystem.
- Cons:
  - significant boilerplate (slices, actions, selectors) for what are mostly simple stores,
  - `createAsyncThunk` duplicates what TanStack Query already does better for server state,
  - adds bundle weight without meaningful benefit at this scale.

### 2. Jotai / Recoil

- Pros: atomic model, fine-grained re-renders.
- Cons:
  - atomic model adds conceptual overhead for stores that are naturally grouped (e.g. `auth`, `events`),
  - less established patterns for the kind of "shared global stream" needed for the event buffer.

### 3. React Context + useReducer

- Pros: zero deps, native React.
- Cons:
  - context triggers full subtree re-renders on every update — catastrophic for a 200-event realtime buffer,
  - no DevTools,
  - verbose for cross-cutting state (tenant + auth + events all needed across many components).

### 4. Zustand + TanStack Query (chosen)

- **Zustand** handles all client and realtime state:
  - small API (`create`, `set`, `get`), minimal boilerplate,
  - stores are module-scoped singletons — easy to import anywhere without providers,
  - selector-based subscriptions mean components only re-render when their slice changes,
  - `events.store` uses a capped array with `addEvent` — efficient for the SSE buffer.
- **TanStack Query** handles all server state:
  - caching, background refetch, pagination, optimistic updates built-in,
  - `useQuery` / `useMutation` hooks are the only way server data enters the UI,
  - integrates cleanly with the future API Gateway (Phase 4+).

## Decision

**Zustand for client + realtime state. TanStack Query for server state.**

### Store responsibilities

| Store          | Library        | Owns                                                    |
| -------------- | -------------- | ------------------------------------------------------- |
| `auth.store`   | Zustand        | Authenticated user, tenantId, role                      |
| `tenant.store` | Zustand        | Active tenant object                                    |
| `events.store` | Zustand        | Realtime event buffer (capped 200), active filters      |
| `ui.store`     | Zustand        | Sidebar state, command palette open, active route       |
| Tenant data    | TanStack Query | Fetched tenant config, members, plan                    |
| Workflow runs  | TanStack Query | Paginated, background-refetched                         |
| Event history  | TanStack Query | Historical events (Phase 4+), separate from live buffer |

### Rules

1. **Never put server data in Zustand.** If it comes from an API, it lives in TanStack Query.
2. **Never put realtime stream data in TanStack Query.** SSE push data goes into `events.store`.
3. **Zustand stores are plain objects** — no async actions, no side effects inside `set`.
   Side effects (SSE connection, mock generator) live in hooks (`useEventStream`).
4. Store files live at `src/stores/*.store.ts`. One store per domain.

## Consequences

- The state boundary is clear and enforced by convention.
  New contributors can reason about where any piece of state lives.
- TanStack Query's DevTools and Zustand's DevTools (via `zustand/middleware`) both
  work in development for full state visibility.
- Phase 3 auth integration replaces the hardcoded `auth.store` values with real JWT
  claims — the store interface stays the same; only the initialisation changes.
- Phase 4 replaces the mock event generator with a real SSE connection — `events.store`
  is unchanged; only `useEventStream` changes.

# ADR-005: Realtime Strategy — SSE with WebSocket Upgrade Path

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: Platform engineering

## Context

The dashboard must display a live stream of `EventEnvelope` objects as they are
emitted by backend services.
Phase 2 has no live backend (it is mocked); Phase 4 introduces the Event Ingestion
Service; Phase 8 deploys to AWS.

The realtime transport decision affects:

- infrastructure complexity (Phase 4+),
- client reconnection and error handling logic,
- the shape of `useEventStream` hook,
- the AWS API Gateway / ALB configuration at deployment time.

## Options Considered

### 1. WebSockets (ws / Socket.IO) from day one

- Pros: bidirectional — supports future use cases (AI token streaming, workflow control).
- Cons:
  - requires a stateful server (sticky sessions or a Redis pub/sub adapter) — more
    infrastructure to manage before Phase 4 is ready,
  - AWS ALB requires separate listener rules and connection draining for WebSocket,
  - `Socket.IO` adds ~25 KB gzip and opinionated protocol on top of ws,
  - bidirectional capability is not needed in Phase 2–3 (all flow is server → client),
  - harder to mock cleanly in a Phase 2 frontend-only context.

### 2. GraphQL Subscriptions (Apollo)

- Pros: schema-typed subscriptions, good tooling.
- Cons:
  - introduces full Apollo stack for a use case that is one event stream,
  - requires a GraphQL server in Phase 4; current services design is REST,
  - significant overhead relative to benefit at this stage.

### 3. Polling (React Query `refetchInterval`)

- Pros: trivial to implement, works everywhere, no persistent connection.
- Cons:
  - high latency (minimum ~1s intervals), bad UX for a "realtime" dashboard,
  - wasteful under load (every tenant polling every second),
  - does not convey "operationally alive" feeling that is a core product goal.

### 4. Server-Sent Events (SSE) with WebSocket upgrade path (chosen)

- Pros:
  - unidirectional (server → client) — exactly what event streaming requires in Phase 2–4,
  - native browser `EventSource` API, no additional client library,
  - HTTP/1.1 compatible, works through standard AWS ALB without special configuration,
  - automatic reconnection built into `EventSource`,
  - easy to mock in Phase 2 with a `setInterval` generator that calls the same handler,
  - straightforward to replace with WebSockets in Phase 6–7 when bidirectional
    control (AI streaming, workflow execution commands) is needed.
- Cons:
  - unidirectional only — Phase 6 AI token streaming will require WebSockets or a
    separate streaming endpoint,
  - HTTP headers only (no binary frames).

## Decision

**Use SSE for Phase 2–5. Introduce WebSockets in Phase 6 for AI streaming.**

### Phase 2 implementation

A mock generator in `useEventStream` pushes synthetic `EventEnvelope` objects
into `events.store` every ~800 ms using a `setInterval`:

```ts
// src/hooks/useEventStream.ts (Phase 2)
useEffect(() => {
  const id = setInterval(() => {
    const envelope = generateMockEvent();
    useEventsStore.getState().addEvent(envelope);
  }, 800);
  return () => clearInterval(id);
}, []);
```

The hook signature is intentionally identical to the Phase 4 SSE implementation
so no call sites change at cut-over.

### Phase 4 cut-over

Replace the `setInterval` body with an `EventSource` connection to
`/api/v1/tenants/:tenantId/events/stream`:

```ts
// src/hooks/useEventStream.ts (Phase 4)
useEffect(() => {
  const es = new EventSource(`/api/v1/tenants/${tenantId}/events/stream`, {
    withCredentials: true,
  });
  es.onmessage = (e) => {
    const envelope = JSON.parse(e.data) as EventEnvelope;
    useEventsStore.getState().addEvent(envelope);
  };
  es.onerror = () => es.close();
  return () => es.close();
}, [tenantId]);
```

### Phase 6 — WebSocket for AI streaming

A separate `useAiStream` hook uses the WebSocket protocol exclusively for
token-by-token AI output. SSE for the event timeline is retained.

### AWS considerations (Phase 8)

- SSE: standard ALB HTTP listener, no additional configuration.
- WebSocket (Phase 6): ALB WebSocket listener with idle timeout ≥ 3600s,
  sticky sessions via load balancer cookies, or a Redis pub/sub adapter
  (if multiple ECS task replicas are needed).

## Consequences

- `useEventStream` is the single abstraction over realtime data.
  No component reads directly from `EventSource` or `WebSocket`.
- The mock path and the live path share the same `events.store.addEvent` interface.
  Phase 4 cut-over is a one-file change.
- SSE reconnection is automatic via `EventSource`; no custom retry logic is needed
  until Phase 4 adds exponential back-off for tenant rate limiting.
- AI token streaming (Phase 6) is handled by a separate hook and does not affect
  the event timeline transport decision.

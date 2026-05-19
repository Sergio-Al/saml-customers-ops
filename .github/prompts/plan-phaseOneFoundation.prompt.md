# Plan: Phase 1 — Foundation & Architecture

## TL;DR

Bootstrap a Turborepo + pnpm monorepo with the full folder structure, shared TypeScript packages, Docker Compose local infra, 2 ADRs, Mermaid architecture diagrams, and a CI/CD skeleton. No business logic — purely the engineering foundation that everything else builds on.

---

## Phase 1A — Monorepo Scaffold (blocks everything)

1. Init git repo + GitHub remote (`ai-ops-platform` or similar name)
2. Bootstrap Turborepo with pnpm workspaces: `pnpm dlx create-turbo@latest .`
3. Configure root `pnpm-workspace.yaml` covering `apps/*`, `services/*`, `packages/*`
4. Create the full folder skeleton (empty dirs + `.gitkeep`):
   - `apps/dashboard-web`, `apps/workflow-builder-web`, `apps/admin-console-web`
   - `services/api-gateway`, `services/auth-service`, `services/tenant-service`, `services/ai-agent-service`, `services/workflow-service`, `services/event-service`, `services/analytics-service`
   - `packages/ui`, `packages/event-sdk`, `packages/auth-sdk`, `packages/shared-types`, `packages/observability-sdk`
   - `infrastructure/docker`, `infrastructure/cdk`, `infrastructure/k8s`
   - `docs/adr`, `docs/architecture`, `docs/diagrams`
5. Set up root `tsconfig.base.json` with strict mode + path aliases; each package extends it
6. Set up ESLint flat config (`eslint.config.mjs`) at root with TypeScript + React rules
7. Set up Prettier with `.prettierrc` at root
8. Set up Husky + lint-staged: pre-commit runs lint + format check
9. Add root `turbo.json` with `build`, `lint`, `test`, `dev` pipeline tasks and proper `dependsOn`

## Phase 1B — Shared Packages (parallel with 1A after scaffold)

10. `packages/shared-types` — core TypeScript types:
    - `EventEnvelope` interface (eventId, tenantId, eventType, correlationId, timestamp, payload)
    - `Tenant`, `User`, `Role` types
    - `PaginatedResponse<T>` generic
    - Export via `index.ts`, no runtime code
11. `packages/event-sdk` — thin event bus abstraction:
    - `IEventPublisher` and `IEventConsumer` interfaces
    - `EventTypes` enum/const with all event names from the plan
    - Depends on `shared-types`
12. `packages/observability-sdk` — OpenTelemetry setup helper:
    - `initTracer(serviceName)` function
    - `correlationMiddleware` for NestJS
    - `withSpan` wrapper utility
13. `packages/ui` — design system shell:
    - Vite lib mode config
    - Export placeholder components: `Button`, `Card`, `Badge`, `Spinner`
    - Tailwind preset config that apps can extend

## Phase 1C — Local Infrastructure (parallel with 1B)

14. `infrastructure/docker/docker-compose.yml`:
    - PostgreSQL 16 with pgvector extension
    - Redis 7
    - (Optional) Kafka + Zookeeper for local event bus
15. `infrastructure/docker/docker-compose.observability.yml` — Grafana + Loki + Tempo + Prometheus (opt-in, heavy)
16. `infrastructure/docker/.env.example` with all connection strings
17. Root `Makefile` scripts: `make dev`, `make infra-up`, `make infra-down`

## Phase 1D — Architecture Docs & ADRs (parallel with 1B/1C)

18. `docs/adr/ADR-001-monorepo-turborepo.md` — why Turborepo over Nx, pnpm over npm/yarn
19. `docs/adr/ADR-002-auth-strategy.md` — local JWT now, Cognito-ready interface, Keycloak migration path
20. `docs/architecture/system-context.md` with Mermaid C4 context diagram
21. `docs/architecture/event-flow.md` with Mermaid event flow diagram (all event types)
22. `docs/architecture/multi-tenant-model.md` — tenant isolation strategy doc
23. `docs/diagrams/` — raw Mermaid source files to later import into Arch I/O

## Phase 1E — CI/CD Skeleton (depends on 1A)

24. `.github/workflows/ci.yml`:
    - Trigger: push to `main` + PRs
    - Jobs: `lint`, `test`, `build` (uses Turborepo remote cache)
    - `docker-compose build` validation job
25. `.github/workflows/release.yml` — stub for later docker push + deploy

---

## Relevant Files

- `turbo.json` — pipeline task graph; `build` depends on `^build`
- `pnpm-workspace.yaml` — workspace glob patterns
- `packages/shared-types/src/events.ts` — `EventEnvelope` is the core contract everything references
- `packages/event-sdk/src/interfaces.ts` — `IEventPublisher`/`IEventConsumer` used by all services
- `infrastructure/docker/docker-compose.yml` — needed before any backend service runs

---

## Verification

1. `pnpm install` completes with no errors from root
2. `pnpm turbo build` succeeds across all packages (empty builds OK)
3. `pnpm turbo lint` passes with zero errors
4. `docker-compose up` brings up PostgreSQL, Redis, pgvector extension loads
5. Husky pre-commit hook fires on `git commit` — blocks on lint errors
6. GitHub Actions CI passes on first push
7. `packages/shared-types` can be imported in a test file in `packages/event-sdk` via path alias

---

## Decisions

- **Auth**: Local JWT auth stub now (no Cognito dependency for local dev). Auth interface designed for drop-in Cognito swap in Phase 3.
- **Event bus local**: Redis Streams for local dev, abstracted behind `IEventPublisher` so EventBridge swaps in for cloud
- **ORM**: Prisma (chosen over TypeORM for better type safety + migration tooling)
- **Observability stack**: Separate docker-compose file so devs can opt-in (heavy)
- **Scope**: Phase 1 produces zero frontend UI and zero business APIs — only foundation

## Out of Scope for Phase 1

- Any NestJS service implementation
- Any React app implementation
- Cognito, AWS services
- Database schema / Prisma migrations

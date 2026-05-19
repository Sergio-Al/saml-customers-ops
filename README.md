# AI Customer Operations Platform

> AI-native operational platform for startups that centralizes customer conversations, AI workflows, realtime operational events, observability, and automation pipelines.

## Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: React + TypeScript + Vite + Tailwind + Zustand + TanStack Query
- **Backend**: NestJS + Prisma + PostgreSQL + Redis
- **AI**: LangChain + pgvector
- **Events**: Redis Streams (local) → EventBridge (cloud)
- **Observability**: OpenTelemetry + Grafana + Loki + Tempo + Prometheus
- **Infra**: AWS CDK + Docker

## Repository Layout

```text
/apps                   Frontend applications
  /dashboard-web
  /workflow-builder-web
  /admin-console-web

/services               Backend microservices (NestJS)
  /api-gateway
  /auth-service
  /tenant-service
  /ai-agent-service
  /workflow-service
  /event-service
  /analytics-service

/packages               Shared TypeScript packages
  /shared-types
  /event-sdk
  /auth-sdk
  /observability-sdk
  /ui

/infrastructure
  /docker               Local development infra
  /cdk                  AWS CDK definitions
  /k8s                  Kubernetes manifests

/docs
  /adr                  Architecture Decision Records
  /architecture         System diagrams and design docs
  /diagrams             Mermaid source files
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start local infrastructure (PostgreSQL + Redis + pgvector)
pnpm infra:up

# Run all dev servers
pnpm dev

# Build everything
pnpm build

# Lint
pnpm lint
```

### Phase 3: Auth + Tenancy (local)

After `pnpm install` and `pnpm infra:up`:

```bash
# 1. Generate Prisma clients (one-time; isolated per service)
pnpm --filter @ai-ops/auth-service prisma:generate
pnpm --filter @ai-ops/tenant-service prisma:generate

# 2. Apply migrations
pnpm --filter @ai-ops/auth-service prisma:migrate
pnpm --filter @ai-ops/tenant-service prisma:migrate

# 3. Seed demo data (order matters — auth first, tenant second)
pnpm --filter @ai-ops/auth-service prisma:seed
pnpm --filter @ai-ops/tenant-service prisma:seed

# 4. Run the three dev processes (in separate shells)
pnpm --filter @ai-ops/auth-service dev      # http://localhost:3001
pnpm --filter @ai-ops/tenant-service dev    # http://localhost:3002
pnpm --filter @ai-ops/dashboard-web dev     # http://localhost:5173
```

Demo credentials: `demo@ai-ops.local` / `demo1234` (tenant `acme`, role `operator`).

**Required env vars**:

| Service        | Variable             | Default                                                                |
| -------------- | -------------------- | ---------------------------------------------------------------------- |
| auth-service   | `DATABASE_URL`       | `postgresql://platform:platform@localhost:5432/platform?schema=auth`   |
| auth-service   | `JWT_SECRET`         | dev-only secret; also used as the internal service handshake           |
| auth-service   | `REFRESH_SECRET`     | dev-only secret                                                        |
| auth-service   | `TENANT_SERVICE_URL` | `http://localhost:3002`                                                |
| auth-service   | `CORS_ORIGIN`        | `http://localhost:5173`                                                |
| tenant-service | `DATABASE_URL`       | `postgresql://platform:platform@localhost:5432/platform?schema=tenant` |
| tenant-service | `JWT_SECRET`         | dev-only secret; should match auth-service for local verification      |
| tenant-service | `CORS_ORIGIN`        | `http://localhost:5173`                                                |

Notes:

- `REFRESH_SECRET` is required by auth-service; tenant-service can reuse `JWT_SECRET` for access-token verification.
- Run migrations in separate schemas (`auth` and `tenant`) to avoid Prisma drift between services.
- `auth-service` now enforces tenant context on protected auth routes: if `X-Tenant-Id` is sent, it must match the tenant claim embedded in the Bearer token.
- On successful login, the dashboard hydrates both auth state and tenant state; logout and forced session expiry clear both.

Frontend env (`apps/dashboard-web/.env.local`, optional — defaults are sane):

```
VITE_AUTH_URL=http://localhost:3001
VITE_TENANT_URL=http://localhost:3002
```

### Troubleshooting (Phase 3)

1. `Cannot find module .../dist/main` when running `pnpm --filter @ai-ops/*-service dev`

- Cause: stale TypeScript incremental metadata (`tsconfig.tsbuildinfo`) can make watch mode report success without emitting `dist` files.
- Fix:

```bash
pnpm --filter @ai-ops/auth-service clean
pnpm --filter @ai-ops/tenant-service clean
pnpm --filter @ai-ops/auth-service build
pnpm --filter @ai-ops/tenant-service build
```

2. `ERR_PACKAGE_PATH_NOT_EXPORTED` for `@ai-ops/auth-sdk`

- Cause: runtime expected a CommonJS-compatible export while the package was only exposed for ESM import.
- Fix: already applied in this repo (`@ai-ops/auth-sdk` now provides dual ESM/CJS outputs, plus a browser-safe `@ai-ops/auth-sdk/client` entry for frontend code).
- If this reappears after local changes, rebuild:

```bash
pnpm --filter @ai-ops/auth-sdk build
```

3. Blank page with browser errors like `util.inherits is not a function`

- Cause: frontend code imported the root `@ai-ops/auth-sdk` entry, which also re-exported Node-only JWT code (`jsonwebtoken`).
- Fix: dashboard code must import the browser-safe client entry:

```ts
import { AuthClient } from "@ai-ops/auth-sdk/client";
```

- If Vite keeps stale dependency cache after changes, rebuild and restart:

```bash
pnpm --filter @ai-ops/auth-sdk build
pnpm --filter @ai-ops/dashboard-web dev --force
```

4. Prisma drift between auth-service and tenant-service migrations

- Cause: both services pointed at the same `public` schema.
- Fix: use split schemas in `DATABASE_URL`:
  - auth-service: `...?schema=auth`
  - tenant-service: `...?schema=tenant`
- Then run migrations in order:

```bash
pnpm --filter @ai-ops/auth-service prisma:migrate
pnpm --filter @ai-ops/tenant-service prisma:migrate
```

5. Login payload reaches Prisma with `email: undefined`

- Cause: Nest DTO classes were imported as type-only imports, so `ValidationPipe` had no runtime metadata and invalid request bodies were not rejected.
- Fix: DTO imports in controllers must be runtime imports, not `import type`.
- Expected behavior after fix: invalid login/register payloads return `400 Bad Request` before hitting Prisma.

## Phase Roadmap

See `init-plan.md` for the full roadmap.

- [x] **Phase 1** — Foundation & Architecture
- [x] **Phase 2** — Frontend Platform Shell
- [x] **Phase 3** — Authentication & Multi-Tenancy
- [ ] **Phase 4** — Event-Driven Core
- [ ] **Phase 5** — AI Agent Platform
- [ ] **Phase 6** — Workflow Builder
- [ ] **Phase 7** — Observability Platform
- [ ] **Phase 8** — Production Infrastructure
- [ ] **Phase 9** — Portfolio Polish

## Architecture

See [docs/architecture/system-context.md](docs/architecture/system-context.md) for the system context and [docs/adr/](docs/adr/) for architecture decisions.

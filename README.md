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

## Phase Roadmap

See `init-plan.md` for the full roadmap.

- [x] **Phase 1** — Foundation & Architecture
- [ ] **Phase 2** — Frontend Platform Shell
- [ ] **Phase 3** — Authentication & Multi-Tenancy
- [ ] **Phase 4** — Event-Driven Core
- [ ] **Phase 5** — AI Agent Platform
- [ ] **Phase 6** — Workflow Builder
- [ ] **Phase 7** — Observability Platform
- [ ] **Phase 8** — Production Infrastructure
- [ ] **Phase 9** — Portfolio Polish

## Architecture

See [docs/architecture/system-context.md](docs/architecture/system-context.md) for the system context and [docs/adr/](docs/adr/) for architecture decisions.

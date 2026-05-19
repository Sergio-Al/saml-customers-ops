# ADR-001: Use Turborepo + pnpm Workspaces for Monorepo

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: Platform engineering

## Context

The AI Customer Operations Platform spans:

- multiple frontend apps (dashboard, workflow builder, admin console),
- multiple NestJS microservices,
- shared TypeScript packages (types, event SDK, observability SDK, UI),
- shared infrastructure code (Docker, AWS CDK).

We need a repository layout and build system that:

1. enables incremental and cached builds across many packages,
2. allows shared TypeScript types and contracts as **first-class workspace packages** (not via publishing),
3. keeps local development setup simple (single `pnpm install` at the root),
4. provides a clean migration path to remote build caching (Vercel / self-hosted).

## Options Considered

### 1. npm / yarn workspaces + custom scripts

- Pros: zero new tooling.
- Cons: no incremental build orchestration; no caching; manual task graph maintenance.

### 2. Nx

- Pros: powerful task graph, plugins for many ecosystems, generators.
- Cons: heavier learning curve; opinionated project structure; over-engineered for our task graph at this stage.

### 3. Turborepo + pnpm workspaces (chosen)

- Pros:
  - minimal config (`turbo.json` + `pnpm-workspace.yaml`),
  - parallel task execution with `dependsOn: ["^build"]`,
  - local + remote caching,
  - pnpm provides strict, fast, content-addressable installs and `workspace:*` protocol.
- Cons:
  - smaller plugin ecosystem than Nx,
  - less guidance for things like code generators.

## Decision

Use **Turborepo + pnpm workspaces**.

- Workspace globs: `apps/*`, `services/*`, `packages/*`.
- Shared packages reference each other with `"workspace:*"` in `dependencies`.
- All packages extend a single root `tsconfig.base.json`.
- Tasks declared in `turbo.json`:
  - `build` with `dependsOn: ["^build"]`,
  - `lint`, `typecheck`, `test`, `dev`.

## Consequences

- All cross-package imports go through declared package names (e.g. `@ai-ops/shared-types`).
- CI must run `pnpm install --frozen-lockfile` and `pnpm turbo build` to benefit from the cache.
- Future migration to remote caching is a config change, not a rewrite.
- Adding a new app or service is a 1-folder, 1-`package.json`, 1-`tsconfig.json` operation.

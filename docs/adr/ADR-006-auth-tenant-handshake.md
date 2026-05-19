# ADR-006: Auth ↔ Tenant Service Handshake

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: Platform engineering

## Context

Phase 3 splits identity and tenancy into two independent NestJS services:

- `auth-service` owns users, passwords, refresh tokens (tables `auth_users`,
  `auth_refresh_tokens`).
- `tenant-service` owns tenants and memberships (tables `tenants`,
  `tenant_memberships`).

JWT claims must carry `tenantId` (`tnt`), so on every `register` and `login`
the auth-service has to learn a user's primary membership from the
tenant-service. On `register` it must also create a new personal tenant.

Three plausible coupling options:

1. **Shared database with cross-table joins** — fastest but couples schemas
   and breaks the service boundary the moment we add row-level multi-tenancy.
2. **Async message bus (Redis Streams / EventBridge)** — pure but adds an
   eventual-consistency window to a synchronous login path; the user cannot
   receive a token until the tenant write has been confirmed.
3. **Synchronous internal HTTP** between the two services, guarded by a
   shared service secret.

## Decision

Use **synchronous internal HTTP** with a shared `X-Service-Secret` header
between auth-service and tenant-service.

- `tenant-service` exposes two internal-only routes, gated by
  `InternalGuard` (header equality check against `process.env.JWT_SECRET`):
  - `POST   /internal/tenants` — create a tenant + owner membership for a new user
  - `GET    /internal/users/:userId/primary-membership` — look up the
    oldest-by-`createdAt` membership for a user
- `auth-service` calls these via a thin `TenantClient` (fetch wrapper) during
  `register` and `login`.
- The two public route trees (`/auth/*` and `/tenants/*`) never call each
  other — only the `/internal/*` tree on tenant-service is allowed from
  auth-service.
- Both services share the same PostgreSQL instance in dev but **not the same
  Prisma client**: each schema generates an isolated client under
  `services/<svc>/node_modules/.prisma/<svc>-client` to keep type boundaries
  honest and avoid pnpm-hoist conflicts.

## Consequences

- Login latency stays synchronous (one extra in-cluster HTTP hop, ~1-2ms
  locally; sub-10ms over VPC in Phase 8).
- The two services remain independently deployable and independently
  schema-owned — tenant-service can be replaced or scaled without touching
  the auth schema.
- The shared secret is intentionally simple for Phase 3. In Phase 8 it will
  be replaced by **mTLS or signed service JWTs** issued by the same
  `IIdentityProvider` (a `typ: "service"` claim). The `InternalGuard` is the
  only file that needs to change.
- Refresh-token rotation stays entirely inside auth-service (no cross-service
  call) — only the user/tenant association is fetched from tenant-service,
  and only on register/login.

## Alternatives revisited

| Option             | Why rejected (for now)                                                          |
| ------------------ | ------------------------------------------------------------------------------- |
| Shared DB joins    | Breaks service-owns-schema rule; makes future tenant-service extraction painful |
| Async message bus  | Adds eventual consistency to a path users experience as "I clicked Login"       |
| Co-located service | Defeats the purpose of splitting auth and tenancy in the first place            |

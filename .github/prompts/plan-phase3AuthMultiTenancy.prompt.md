# Plan: Phase 3 — Authentication & Multi-Tenancy

## TL;DR

Build enterprise-grade identity end-to-end: `packages/auth-sdk` provider abstraction → `services/auth-service` (NestJS + Prisma + local JWT) → `services/tenant-service` (NestJS + Prisma) → dashboard-web wiring (real LoginPage, AuthGuard redirect, Bearer header, RBAC). No AWS Cognito in this phase — `LocalJwtProvider` behind `IIdentityProvider` (ADR-002). Cognito arrives in Phase 8 as a new provider implementation.

---

## Phase 3A — `packages/auth-sdk` _(foundational, no dependencies)_

**Steps:**

1. Scaffold package: `package.json` (`@ai-ops/auth-sdk`), `tsconfig.json` (extends base, `declaration: true`, `composite: true`)
2. `src/types.ts` — `AuthContext { userId, tenantId, role, email }`, `AuthClaims`, `TokenPair { accessToken, refreshToken, expiresIn }`, `AuthError`
3. `src/provider.interface.ts` — `IIdentityProvider` interface with `verifyToken(token): Promise<AuthContext>`, `issueToken(claims): Promise<TokenPair>`, `refresh(refreshToken): Promise<TokenPair>`
4. `src/local-jwt.provider.ts` — `LocalJwtProvider` implements `IIdentityProvider`; uses `jsonwebtoken` to sign/verify; signs with `JWT_SECRET` env; access token 15m, refresh token 7d; embeds `sub=userId`, `tnt=tenantId`, `role` claims
5. `src/client.ts` — `AuthClient` for browser: `login(email, password)` → `POST /auth/login`, `logout()` → `POST /auth/logout`, `refresh()` → `POST /auth/refresh`, `getMe()` → `GET /auth/me`; stores access token in memory (module var); uses `fetch`
6. `src/index.ts` — re-export all

---

## Phase 3B — `services/auth-service` _(depends on 3A)_

**Steps:** 7. Scaffold NestJS service: `package.json` (`@ai-ops/auth-service`), `tsconfig.json`, `nest-cli.json`, `src/main.ts` on port 3001 8. Prisma schema (`prisma/schema.prisma`): `datasource` → PostgreSQL `DATABASE_URL`; models `User { id, email, passwordHash, displayName, createdAt, updatedAt }`, `RefreshToken { id, userId, token (hashed), expiresAt, revokedAt? }`; generate migration `001_auth_init` 9. `AuthModule` with `AuthService`, `AuthController`:

- `POST /auth/register` → hash password (bcrypt, 12 rounds), create User, issue `TokenPair` via `LocalJwtProvider.issueToken()`
- `POST /auth/login` → verify password, issue `TokenPair`; store hashed refresh token in DB
- `POST /auth/refresh` → verify refresh token from body, issue new `TokenPair`, rotate old refresh token
- `GET /auth/me` → `JwtGuard` middleware verifies Bearer, returns `AuthContext`
- `POST /auth/logout` → revoke refresh token

10. `JwtGuard` — calls `IIdentityProvider.verifyToken()`; attaches `AuthContext` to `request.auth`; returns 401 on invalid/expired
11. `TenantMiddleware` — reads `X-Tenant-Id` header; validates tenant exists (HTTP call to tenant-service or shared DB query); attaches `tenantId` to request
12. CORS enabled for `http://localhost:5173`
13. `.env.example`: `DATABASE_URL`, `JWT_SECRET`, `REFRESH_SECRET`, `PORT=3001`

---

## Phase 3C — `services/tenant-service` _(parallel with 3B)_

**Steps:** 14. Scaffold NestJS service on port 3002; Prisma schema with models `Tenant { id, slug, name, plan, createdAt, updatedAt }`, `TenantMembership { id, userId, tenantId, role, createdAt }`; migration `001_tenant_init` 15. `TenantModule` with `TenantService`, `TenantController`:

- `POST /tenants` → create tenant + seed `TenantMembership` (userId as owner) — called by auth-service on register
- `GET /tenants/:id` → returns `Tenant` (requires JwtGuard + membership check)
- `GET /tenants/me` → returns tenants for authenticated user via membership lookup
- `GET /tenants/:id/members` → returns `TenantMembership[]` (owner/admin only)
- `POST /tenants/:id/members` → invite user by email (sets role)

16. `JwtGuard` — shared pattern with auth-service (same `IIdentityProvider.verifyToken()`)
17. CORS enabled; `.env.example`: `DATABASE_URL`, `JWT_SECRET`, `PORT=3002`

---

## Phase 3D — Frontend auth wiring _(depends on 3B + 3C running)_

**Steps:** 18. `packages/auth-sdk` already built — add `@ai-ops/auth-sdk workspace:*` to `dashboard-web/package.json` 19. Expand `src/stores/auth.store.ts`: add `token: string | null`, `setAuth(user, token, tenantId, role): void` — synchronous atomic setter; `logout(): void` — synchronous state clear (resets user/token/tenantId/role to null). **No async actions** per ADR-004 Rule 3. `setUser` stays for compatibility. 20. `src/lib/http.ts` — base `fetch` utility used exclusively inside TanStack Query `queryFn`/`mutationFn` (never called directly from components — ADR-004 Rule 1). Attaches `Authorization: Bearer <token>` + `X-Tenant-Id`; on 401 → calls `AuthClient.refresh()` → retries once → on second 401 calls `useAuth.logout()` + redirects to `/login` 21. `src/hooks/useCurrentUser.ts` — TanStack Query `useQuery` wrapping `GET /auth/me`; on success calls `setAuth(...)` to hydrate store 22. `src/pages/LoginPage.tsx` — real form: email + password inputs; calls `AuthClient.login()` via TanStack Query `useMutation`; on success calls `useAuth.setAuth(...)` + `useTenant.setTenant(...)` + `navigate('/dashboard')`; error toast on 401 23. `src/guards/AuthGuard.tsx` — replace stub: check `useAuth(s => s.token)`; if null redirect to `/login` using `<Navigate>`; render children if authenticated 24. Update `AppLayout.tsx` — add logout button that calls `useMutation` (`POST /auth/logout`); in `onSettled` calls synchronous `useAuth.logout()` + `navigate('/login')`. API call in mutation; state clear in Zustand. (ADR-004 Rule 3)

---

## Phase 3E — Frontend RBAC _(depends on 3D)_

**Steps:** 25. `src/hooks/usePermissions.ts` — `PERMISSION_MAP: Record<UserRole, Permission[]>` (e.g. `analyst` can view only; `operator` can view+act; `admin` can view+act+configure; `owner` = all); exports `usePermissions()` returning `{ can(permission): boolean }` 26. `src/components/Can.tsx` — `<Can permission="..." fallback?>{children}</Can>` — renders children only if `can(permission)` is true; renders `fallback` or null otherwise 27. Apply `<Can>` in `AppLayout` sidebar: hide "Settings" nav item for `analyst` role; hide tenant management for non-owner/admin 28. `src/guards/RoleGuard.tsx` — wraps routes requiring specific roles; redirects to `/dashboard` if insufficient role (used on `/settings` route in router)

---

## Phase 3F — Local dev integration & docker _(depends on 3B + 3C)_

**Steps:** 29. Add `auth-service` and `tenant-service` entries to `docker-compose.yml` (or separate `docker-compose.services.yml`) with `depends_on: postgres` and env vars; OR document running services with `pnpm dev` (no docker for services in dev — run directly with `pnpm --filter @ai-ops/auth-service dev`) 30. Add `.env.development` to both services with matching `JWT_SECRET` + `DATABASE_URL` pointing to local docker postgres 31. Run Prisma migrations: `pnpm --filter @ai-ops/auth-service prisma:migrate` + `pnpm --filter @ai-ops/tenant-service prisma:migrate` 32. Seed script: creates demo tenant `acme` + demo user `demo@ai-ops.local / demo1234` with role `operator` — matches Phase 2 hardcoded values 33. Add `turbo.json` pipeline entry for `db:migrate` and `db:seed` (marked `cache: false`)

---

## Relevant files

- `packages/auth-sdk/` — build from scratch (`.gitkeep` only)
- `services/auth-service/` — build from scratch (`.gitkeep` only)
- `services/tenant-service/` — build from scratch (`.gitkeep` only)
- `packages/shared-types/src/user.ts` — `User`, `Role`, `TenantMembership` already defined — reuse, do NOT duplicate
- `packages/shared-types/src/tenant.ts` — `Tenant`, `TenantConfig`, `TenantLimits` already defined
- `apps/dashboard-web/src/stores/auth.store.ts` — expand with `token`, `setAuth`, `logout`
- `apps/dashboard-web/src/stores/tenant.store.ts` — wire `setTenant` from login response
- `apps/dashboard-web/src/guards/AuthGuard.tsx` — replace stub
- `apps/dashboard-web/src/pages/StubPages.tsx` (LoginPage) — replace with real form
- `apps/dashboard-web/src/layouts/AppLayout.tsx` — add logout button
- `apps/dashboard-web/package.json` — add `@ai-ops/auth-sdk workspace:*`
- `infrastructure/docker/docker-compose.yml` — postgres + redis already present
- `docs/adr/ADR-002-auth-strategy.md` — already written, follow exactly

---

## Verification

1. `pnpm turbo run build` — zero errors across all packages + both new services
2. `pnpm turbo run typecheck` + `pnpm turbo run lint` — zero errors/warnings
3. Start docker infra: `docker compose -f infrastructure/docker/docker-compose.yml up -d`
4. Run migrations: `pnpm --filter @ai-ops/auth-service prisma:migrate` + tenant-service equivalent
5. Start services: `pnpm --filter "@ai-ops/auth-service" dev` + `pnpm --filter "@ai-ops/tenant-service" dev`
6. `POST /auth/register` with `{ email, password, displayName }` → returns `TokenPair`
7. `POST /auth/login` → returns `TokenPair`; invalid password → 401
8. `GET /auth/me` with Bearer token → returns user + tenantId + role
9. `POST /auth/refresh` with expired access token → returns new `TokenPair`
10. Browser: `http://localhost:5173/dashboard` → redirects to `/login` (AuthGuard active)
11. Fill login form with seed credentials `demo@ai-ops.local / demo1234` → lands on `/dashboard`
12. Verify `useAuth` store has real token + tenantId + role from server
13. Reload page → session lost (expected — no persistence yet); note Phase 8 adds `localStorage` persistence or secure cookie
14. Set role to `analyst` in seed → Settings nav item hidden (RBAC)
15. `POST /auth/logout` → refresh token revoked; subsequent refresh → 401

---

## Decisions

- **No Cognito in Phase 3** — `LocalJwtProvider` per ADR-002; Cognito is Phase 8 (`CognitoJwtProvider` drops in)
- **No API Gateway in Phase 3** — frontend calls auth-service (:3001) and tenant-service (:3002) directly; CORS enabled per service. Full gateway in Phase 4.
- **Access token in memory only** (Zustand state, not localStorage) — survives page tab but not full refresh. Clean security posture; Phase 8 upgrades to httpOnly cookie + silent refresh.
- **Single PostgreSQL database, separate schemas** — both services share the docker postgres instance, using different table prefixes (not separate DBs). Simpler for local dev; each service has its own Prisma schema file.
- **Seed script produces Phase 2 parity** — demo credentials match hardcoded Phase 2 values so dashboard works immediately after login.

---

## Further Considerations

1. **Token persistence across page reloads** — Current plan: token lives in Zustand (memory only). On refresh, user must log in again. Options: (A) persist token to `sessionStorage` — survives same tab refresh, cleared on close; (B) silent refresh via httpOnly cookie — most secure, needs backend cookie support. Recommendation: (A) `sessionStorage` for Phase 3 as a pragmatic middle ground.
2. **Inter-service auth** — tenant-service needs to trust JWTs issued by auth-service. Both share `JWT_SECRET` env var for Phase 3. In Phase 4+ they'll communicate via the event bus; direct HTTP calls between services should use service tokens or internal network trust.
3. **Multi-tenant login UX** — current plan: one user → one tenant. Multi-tenant switching (tenant picker after login) is a Phase 3+ extension but the data model (`TenantMembership`) already supports it.

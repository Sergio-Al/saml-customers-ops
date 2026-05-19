# ADR-002: Authentication Strategy — Local JWT Now, Cognito-Ready Interface

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: Platform engineering

## Context

Phase 3 of the platform introduces authentication and multi-tenancy.
The original plan suggested starting directly with **AWS Cognito**.

Concerns:

- Cognito requires AWS account configuration before any developer can run the platform locally.
- It couples local dev to network availability and AWS credentials.
- It pushes us to defer all auth work until cloud infra (Phase 8) is partially in place.

We still want:

- a credible, enterprise-grade identity story,
- a path to Cognito (and later Keycloak),
- the ability to enforce tenant-aware RBAC end-to-end from day one of Phase 3.

## Decision

Use a **local JWT-based auth implementation** behind an `IIdentityProvider`
interface in `@ai-ops/auth-sdk`. Implementations:

| Phase | Implementation        | Use case                           |
| ----- | --------------------- | ---------------------------------- |
| 3     | `LocalJwtProvider`    | Local dev, demos, CI integration   |
| 8     | `CognitoJwtProvider`  | AWS-hosted environments            |
| Later | `KeycloakJwtProvider` | Self-hosted / enterprise customers |

The interface exposes:

- `verifyToken(token: string): Promise<AuthContext>`
- `issueToken(claims: AuthClaims): Promise<TokenPair>` (only used by local provider)
- `refresh(refreshToken: string): Promise<TokenPair>`

`AuthContext` always carries:

- `userId`
- `tenantId` (from a `tnt` JWT claim)
- `role`
- `correlationId` (propagated, not part of the token)

Services depend only on `IIdentityProvider`; swapping providers is a DI binding change.

## Consequences

- Phase 3 can ship end-to-end auth + tenancy without any AWS dependency.
- Cognito migration in Phase 8 is a new provider implementation, not a refactor of
  the consuming services.
- RBAC, tenant middleware, and route guards are tested locally with `LocalJwtProvider`
  before any cloud deployment.
- The frontend `@ai-ops/auth-sdk` exposes the same surface regardless of backend
  provider, so login UI stays unchanged across migrations.

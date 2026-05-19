import type { Role } from "@ai-ops/shared-types";

/**
 * Resolved auth context attached to a request after JWT verification.
 * Always tenant-scoped per ADR-002.
 */
export interface AuthContext {
  userId: string;
  tenantId: string;
  role: Role;
  email: string;
}

/**
 * Claims input when issuing a fresh token pair.
 * The provider is responsible for adding `iat`, `exp`, `sub`.
 */
export interface AuthClaims {
  userId: string;
  tenantId: string;
  role: Role;
  email: string;
}

/**
 * Token pair returned by login/refresh.
 * `expiresIn` is the access-token lifetime in seconds.
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Typed error envelope for auth failures.
 * Providers throw `AuthError` rather than raw `Error`.
 */
export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export type AuthErrorCode =
  | "invalid_token"
  | "expired_token"
  | "invalid_refresh"
  | "invalid_credentials"
  | "missing_tenant";

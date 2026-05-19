import type { AuthClaims, AuthContext, TokenPair } from "./types.js";

/**
 * Identity provider abstraction. Phase 3 ships `LocalJwtProvider`.
 * Phase 8 swaps in `CognitoJwtProvider` without consumer changes.
 *
 * See ADR-002.
 */
export interface IIdentityProvider {
  /** Verify an access token and return the resolved auth context. */
  verifyToken(token: string): Promise<AuthContext>;
  /** Issue a fresh access + refresh token pair. */
  issueToken(claims: AuthClaims): Promise<TokenPair>;
  /** Exchange a refresh token for a new token pair. */
  refresh(refreshToken: string): Promise<TokenPair>;
}

import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import type { Role } from "@ai-ops/shared-types";
import type { IIdentityProvider } from "./provider.interface.js";
import { AuthError, type AuthClaims, type AuthContext, type TokenPair } from "./types.js";

export interface LocalJwtProviderOptions {
  /** Secret used to sign + verify access tokens. */
  accessSecret: string;
  /** Secret used to sign + verify refresh tokens. */
  refreshSecret: string;
  /** Access token lifetime in seconds. Default 15m. */
  accessTtlSeconds?: number;
  /** Refresh token lifetime in seconds. Default 7d. */
  refreshTtlSeconds?: number;
  /** Issuer claim. Default "ai-ops". */
  issuer?: string;
}

interface AccessPayload extends JwtPayload {
  sub: string;
  tnt: string;
  role: Role;
  email: string;
}

interface RefreshPayload extends JwtPayload {
  sub: string;
  tnt: string;
  role: Role;
  email: string;
  typ: "refresh";
}

/**
 * Local JWT identity provider — Phase 3.
 *
 * Self-contained: no external IdP. Signs HS256 tokens with two secrets
 * (access + refresh). Embeds tenant + role claims so every consumer can
 * enforce RBAC without an extra lookup.
 */
export class LocalJwtProvider implements IIdentityProvider {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessTtl: number;
  private readonly refreshTtl: number;
  private readonly issuer: string;

  constructor(opts: LocalJwtProviderOptions) {
    if (!opts.accessSecret || !opts.refreshSecret) {
      throw new Error("LocalJwtProvider: accessSecret and refreshSecret are required");
    }
    this.accessSecret = opts.accessSecret;
    this.refreshSecret = opts.refreshSecret;
    this.accessTtl = opts.accessTtlSeconds ?? 15 * 60;
    this.refreshTtl = opts.refreshTtlSeconds ?? 7 * 24 * 60 * 60;
    this.issuer = opts.issuer ?? "ai-ops";
  }

  async verifyToken(token: string): Promise<AuthContext> {
    try {
      const payload = jwt.verify(token, this.accessSecret, {
        issuer: this.issuer,
      }) as AccessPayload;
      return {
        userId: payload.sub,
        tenantId: payload.tnt,
        role: payload.role,
        email: payload.email,
      };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AuthError("expired_token", "Access token expired");
      }
      throw new AuthError("invalid_token", "Invalid access token");
    }
  }

  async issueToken(claims: AuthClaims): Promise<TokenPair> {
    const accessToken = this.sign(
      { tnt: claims.tenantId, role: claims.role, email: claims.email },
      claims.userId,
      this.accessSecret,
      this.accessTtl,
    );
    const refreshToken = this.sign(
      { tnt: claims.tenantId, role: claims.role, email: claims.email, typ: "refresh" },
      claims.userId,
      this.refreshSecret,
      this.refreshTtl,
    );
    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTtl,
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: RefreshPayload;
    try {
      payload = jwt.verify(refreshToken, this.refreshSecret, {
        issuer: this.issuer,
      }) as RefreshPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AuthError("invalid_refresh", "Refresh token expired");
      }
      throw new AuthError("invalid_refresh", "Invalid refresh token");
    }
    if (payload.typ !== "refresh") {
      throw new AuthError("invalid_refresh", "Token is not a refresh token");
    }
    return this.issueToken({
      userId: payload.sub,
      tenantId: payload.tnt,
      role: payload.role,
      email: payload.email,
    });
  }

  private sign(
    extra: Record<string, unknown>,
    subject: string,
    secret: string,
    ttlSeconds: number,
  ): string {
    const options: SignOptions = {
      subject,
      issuer: this.issuer,
      expiresIn: ttlSeconds,
      algorithm: "HS256",
    };
    return jwt.sign(extra, secret, options);
  }
}

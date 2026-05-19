import type { Role, User } from "@ai-ops/shared-types";
import { AuthError, type TokenPair } from "./types.js";

export interface LoginResponse {
  user: User;
  tenantId: string;
  role: Role;
  tokens: TokenPair;
}

export interface MeResponse {
  user: User;
  tenantId: string;
  role: Role;
}

export interface AuthClientOptions {
  /** Base URL of auth-service, e.g. `http://localhost:3001`. */
  baseUrl: string;
}

/**
 * Browser-side auth client.
 *
 * Stores the access token in module-scoped memory (no localStorage) per ADR-002
 * security posture. Consumers should call `setAccessToken(null)` on logout.
 */
export class AuthClient {
  private readonly baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(opts: AuthClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, "");
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setTokens(tokens: TokenPair | null): void {
    this.accessToken = tokens?.accessToken ?? null;
    this.refreshToken = tokens?.refreshToken ?? null;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await this.request("POST", "/auth/login", { email, password });
    const data = (await res.json()) as LoginResponse;
    this.setTokens(data.tokens);
    return data;
  }

  async logout(): Promise<void> {
    if (!this.refreshToken) {
      this.setTokens(null);
      return;
    }
    try {
      await this.request("POST", "/auth/logout", { refreshToken: this.refreshToken });
    } finally {
      this.setTokens(null);
    }
  }

  async refresh(): Promise<TokenPair> {
    if (!this.refreshToken) {
      throw new AuthError("invalid_refresh", "No refresh token available");
    }
    const res = await this.request("POST", "/auth/refresh", { refreshToken: this.refreshToken });
    const tokens = (await res.json()) as TokenPair;
    this.setTokens(tokens);
    return tokens;
  }

  async getMe(): Promise<MeResponse> {
    const res = await this.request("GET", "/auth/me");
    return (await res.json()) as MeResponse;
  }

  private async request(method: "GET" | "POST", path: string, body?: unknown): Promise<Response> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 401) {
        throw new AuthError("invalid_credentials", text || "Unauthorized");
      }
      throw new AuthError("invalid_token", text || `Request failed: ${res.status}`);
    }
    return res;
  }
}

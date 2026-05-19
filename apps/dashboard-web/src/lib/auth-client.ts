import { AuthClient } from "@ai-ops/auth-sdk/client";

const AUTH_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:3001";
const TENANT_URL = import.meta.env.VITE_TENANT_URL || "http://localhost:3002";

/** Singleton AuthClient — holds the in-memory access + refresh tokens. */
export const authClient = new AuthClient({ baseUrl: AUTH_URL });

export const TENANT_BASE_URL = TENANT_URL;
export const AUTH_BASE_URL = AUTH_URL;

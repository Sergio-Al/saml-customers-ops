import { useAuth } from "@/stores/auth.store";
import { useTenant } from "@/stores/tenant.store";
import { authClient } from "./auth-client";

export interface HttpOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  /** Skip the silent-refresh + redirect-to-login on 401. Useful for /login itself. */
  skipAuthRetry?: boolean;
}

export class HttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Base fetch utility. ONLY call from inside TanStack Query `queryFn`/`mutationFn`
 * — never from components directly (ADR-004 Rule 1).
 *
 * Attaches `Authorization: Bearer <token>` + `X-Tenant-Id` automatically.
 * On 401: attempts a single silent refresh, retries; if that fails, logs out
 * and redirects to /login.
 */
export async function http<T = unknown>(url: string, opts: HttpOptions = {}): Promise<T> {
  const res = await rawFetch(url, opts);
  if (res.status !== 401 || opts.skipAuthRetry) {
    return parse<T>(res, url);
  }

  // ---- 401 path: try silent refresh once ----
  try {
    const pair = await authClient.refresh();
    // Update store atomically with new access token.
    const snap = useAuth.getState();
    if (snap.user && snap.tenantId && snap.role) {
      useAuth.getState().setAuth({
        user: snap.user,
        token: pair.accessToken,
        tenantId: snap.tenantId,
        role: snap.role,
      });
    }
  } catch {
    forceLogout();
    throw new HttpError(401, null, "Session expired");
  }

  const retry = await rawFetch(url, opts);
  if (retry.status === 401) {
    forceLogout();
    throw new HttpError(401, null, "Session expired");
  }
  return parse<T>(retry, url);
}

async function rawFetch(url: string, opts: HttpOptions): Promise<Response> {
  const { token, tenantId } = useAuth.getState();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...opts.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (tenantId) headers["X-Tenant-Id"] = tenantId;
  return fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
}

async function parse<T>(res: Response, url: string): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }
  const ctype = res.headers.get("content-type") ?? "";
  const data: unknown = ctype.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);
  if (!res.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : `Request failed (${res.status}): ${url}`;
    throw new HttpError(res.status, data, message);
  }
  return data as T;
}

function forceLogout(): void {
  authClient.setTokens(null);
  useTenant.getState().setTenant(null);
  useAuth.getState().logout();
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

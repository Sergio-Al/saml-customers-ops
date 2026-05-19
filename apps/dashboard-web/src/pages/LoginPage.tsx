import { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Activity, Loader2 } from "lucide-react";
import type { Tenant } from "@ai-ops/shared-types";
import { authClient } from "@/lib/auth-client";
import { TENANT_BASE_URL } from "@/lib/auth-client";
import { useAuth, type UserRole } from "@/stores/auth.store";
import { useTenant } from "@/stores/tenant.store";

interface LoginInput {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuth((s) => s.setAuth);
  const setTenant = useTenant((s) => s.setTenant);
  const [email, setEmail] = useState("demo@ai-ops.local");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ email, password }: LoginInput) => authClient.login(email, password),
    onSuccess: (data) => {
      setAuth({
        user: {
          id: data.user.id,
          name: data.user.displayName,
          email: data.user.email,
        },
        token: data.tokens.accessToken,
        tenantId: data.tenantId,
        role: data.role as UserRole,
      });

      // Hydrate tenant store so tenant-aware UI can render immediately after login.
      void fetch(`${TENANT_BASE_URL}/tenants/${data.tenantId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.tokens.accessToken}`,
          "X-Tenant-Id": data.tenantId,
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            setTenant(null);
            return;
          }
          const tenant = (await res.json()) as Tenant;
          setTenant(tenant);
        })
        .catch(() => {
          setTenant(null);
        });

      const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
      navigate(from, { replace: true });
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Sign in failed");
    },
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    mutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo / brand */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ai/15 ring-1 ring-ai/40">
            <Activity size={16} className="text-ai" />
          </div>
          <div>
            <div className="font-display text-[18px] font-semibold tracking-tight text-text-primary">
              AI Ops
            </div>
            <div className="font-mono text-[11px] text-text-muted">control plane</div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-md border border-border-op bg-panel p-6">
          <div className="mb-6">
            <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
              Sign in
            </h1>
            <p className="mt-1 text-[13px] text-text-tertiary">
              Authenticate to your operational workspace.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
              disabled={mutation.isPending}
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
              disabled={mutation.isPending}
            />

            {errorMessage && (
              <div
                role="alert"
                className="rounded-sm border border-error/40 bg-error/10 px-3 py-2 text-[13px] text-error"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-text-primary px-4 text-[13px] font-semibold text-canvas transition-colors hover:bg-text-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {mutation.isPending ? "Signing in" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 border-t border-hairline pt-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
              demo credentials
            </div>
            <div className="mt-1 font-mono text-[12px] text-text-tertiary">
              demo@ai-ops.local / demo1234
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
}

function Field({ label, type, value, onChange, autoComplete, required, disabled }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-text-secondary">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className="h-10 rounded-sm border border-border-op bg-elevated px-3 text-[13px] text-text-primary placeholder:text-text-muted focus:border-ai/60 focus:outline-none focus:ring-1 focus:ring-ai/40 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

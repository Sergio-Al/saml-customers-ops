import type { ReactNode } from "react";

function Placeholder({ phase, title }: { phase: string; title: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="font-display text-[28px] font-semibold text-text-primary">{title}</div>
        <div className="mt-2 text-[13px] font-mono text-text-tertiary">{phase}</div>
      </div>
    </div>
  );
}

export function EventsPage(): ReactNode {
  return <Placeholder phase="Phase 4 — Event Stream" title="Events" />;
}

export function WorkflowsPage(): ReactNode {
  return <Placeholder phase="Phase 6 — Workflow Builder" title="Workflows" />;
}

export function SettingsPage(): ReactNode {
  return <Placeholder phase="Phase 3 — Tenant & RBAC" title="Settings" />;
}

export function LoginPage(): ReactNode {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <Placeholder phase="Phase 3 — Authentication" title="Sign in" />
    </div>
  );
}

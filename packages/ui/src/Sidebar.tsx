import type { ReactNode } from "react";
import { Badge } from "./Badge.js";

export interface SidebarProps {
  logo?: ReactNode;
  children?: ReactNode;
  tenantName?: string;
  tenantPlan?: string;
}

export function Sidebar({ logo, children, tenantName, tenantPlan }: SidebarProps) {
  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col border-r border-border-op bg-panel">
      {logo && (
        <div className="flex h-14 items-center border-b border-border-op px-4 text-text-primary">
          {logo}
        </div>
      )}
      <nav className="flex-1 overflow-y-auto px-2 py-4">{children}</nav>
      {tenantName && (
        <div className="flex items-center justify-between border-t border-border-op px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-text-primary">{tenantName}</div>
            <div className="text-[11px] font-mono text-text-muted">tenant</div>
          </div>
          {tenantPlan && <Badge tone="ai">{tenantPlan}</Badge>}
        </div>
      )}
    </aside>
  );
}

export interface NavItemProps {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
  const base =
    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors text-left";
  const state = active
    ? "bg-elevated border-l-2 border-hairline text-text-primary"
    : "text-text-secondary hover:text-text-primary hover:bg-elevated/50";

  return (
    <button type="button" onClick={onClick} className={`${base} ${state}`}>
      {icon && <span className="text-text-tertiary">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
}

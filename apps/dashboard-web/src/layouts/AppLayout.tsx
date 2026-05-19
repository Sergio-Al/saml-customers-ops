import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Sidebar, NavItem, RealtimeBadge } from "@ai-ops/ui";
import { LayoutDashboard, Radio, GitFork, Settings, LogOut } from "lucide-react";
import { useTenant } from "@/stores/tenant.store";
import { useAuth } from "@/stores/auth.store";
import { useEventStream } from "@/hooks/useEventStream";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { authClient } from "@/lib/auth-client";
import { Can } from "@/components/Can";

const NAV = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={14} />,
    permission: "view:dashboard" as const,
  },
  {
    to: "/events",
    label: "Events",
    icon: <Radio size={14} />,
    permission: "view:events" as const,
  },
  {
    to: "/workflows",
    label: "Workflows",
    icon: <GitFork size={14} />,
    permission: "view:workflows" as const,
  },
  {
    to: "/settings",
    label: "Settings",
    icon: <Settings size={14} />,
    permission: "configure:tenant" as const,
  },
];

export function AppLayout() {
  const tenant = useTenant((s) => s.activeTenant);
  const setTenant = useTenant((s) => s.setTenant);
  const user = useAuth((s) => s.user);
  const tenantId = useAuth((s) => s.tenantId);
  const logoutStore = useAuth((s) => s.logout);
  const { connected } = useEventStream();
  const navigate = useNavigate();

  // Hydrate /auth/me on mount so user + tenant data is fresh.
  useCurrentUser();

  const logoutMutation = useMutation({
    mutationFn: async () => authClient.logout(),
    onSettled: () => {
      setTenant(null);
      logoutStore();
      navigate("/login", { replace: true });
    },
  });

  return (
    <div className="flex min-h-screen bg-canvas text-text-primary">
      <Sidebar
        logo={
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-ai/20 ring-1 ring-ai/40" />
            <span className="font-display text-[15px] font-semibold tracking-tight">AI Ops</span>
          </div>
        }
        tenantName={tenant?.name ?? tenantId ?? undefined}
        tenantPlan={tenant?.plan}
      >
        <div className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <Can key={item.to} permission={item.permission}>
              <NavLink to={item.to} className="block">
                {({ isActive }) => (
                  <NavItem label={item.label} icon={item.icon} active={isActive} />
                )}
              </NavLink>
            </Can>
          ))}
        </div>
      </Sidebar>
      <main className="flex flex-1 flex-col overflow-y-auto bg-canvas">
        <header className="flex h-14 items-center justify-between border-b border-border-op px-6">
          <div className="font-display text-[15px] font-medium text-text-secondary">
            Control Plane
          </div>
          <div className="flex items-center gap-4">
            <RealtimeBadge connected={connected} />
            {user && (
              <div className="flex items-center gap-3 border-l border-border-op pl-4">
                <div className="text-right">
                  <div className="text-[12px] font-medium text-text-primary">{user.name}</div>
                  <div className="font-mono text-[10px] text-text-muted">{user.email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  title="Sign out"
                  className="flex h-8 w-8 items-center justify-center rounded-sm border border-border-op bg-elevated text-text-tertiary transition-colors hover:border-hairline hover:text-text-primary disabled:opacity-60"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
        </header>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import { NavLink, Outlet } from "react-router-dom";
import { Sidebar, NavItem, RealtimeBadge } from "@ai-ops/ui";
import { useTenant } from "@/stores/tenant.store";
import { useEventStream } from "@/hooks/useEventStream";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/events", label: "Events" },
  { to: "/workflows", label: "Workflows" },
  { to: "/settings", label: "Settings" },
];

export function AppLayout() {
  const tenant = useTenant((s) => s.activeTenant);
  const { connected } = useEventStream();

  return (
    <div className="flex min-h-screen bg-canvas text-text-primary">
      <Sidebar
        logo={
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-ai/20 ring-1 ring-ai/40" />
            <span className="font-display text-[15px] font-semibold tracking-tight">AI Ops</span>
          </div>
        }
        tenantName={tenant?.name}
        tenantPlan={tenant?.plan}
      >
        <div className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className="block">
              {({ isActive }) => <NavItem label={item.label} active={isActive} />}
            </NavLink>
          ))}
        </div>
      </Sidebar>
      <main className="flex flex-1 flex-col overflow-y-auto bg-canvas">
        <header className="flex h-14 items-center justify-between border-b border-border-op px-6">
          <div className="font-display text-[15px] font-medium text-text-secondary">
            Control Plane
          </div>
          <RealtimeBadge connected={connected} />
        </header>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

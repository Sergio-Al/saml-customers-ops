import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "@/stores/auth.store";

interface RoleGuardProps {
  allow: UserRole[];
  children: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ allow, children, redirectTo = "/dashboard" }: RoleGuardProps) {
  const role = useAuth((s) => s.role);
  if (!role || !allow.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}

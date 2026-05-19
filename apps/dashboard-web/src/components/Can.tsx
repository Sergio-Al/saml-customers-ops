import type { ReactNode } from "react";
import { usePermissions, type Permission } from "@/hooks/usePermissions";

interface CanProps {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ permission, fallback = null, children }: CanProps) {
  const { can } = usePermissions();
  return <>{can(permission) ? children : fallback}</>;
}

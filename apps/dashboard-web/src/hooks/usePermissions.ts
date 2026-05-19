import { useAuth, type UserRole } from "@/stores/auth.store";

export type Permission =
  | "view:dashboard"
  | "view:events"
  | "view:workflows"
  | "act:workflows"
  | "configure:tenant"
  | "manage:members"
  | "manage:billing";

const VIEW: Permission[] = ["view:dashboard", "view:events", "view:workflows"];
const ACT: Permission[] = [...VIEW, "act:workflows"];
const CONFIGURE: Permission[] = [...ACT, "configure:tenant", "manage:members"];
const ALL: Permission[] = [...CONFIGURE, "manage:billing"];

export const PERMISSION_MAP: Record<UserRole, Permission[]> = {
  analyst: VIEW,
  operator: ACT,
  admin: CONFIGURE,
  owner: ALL,
};

export interface PermissionsApi {
  role: UserRole | null;
  can: (permission: Permission) => boolean;
}

export function usePermissions(): PermissionsApi {
  const role = useAuth((s) => s.role);
  return {
    role,
    can: (permission) => {
      if (!role) return false;
      return PERMISSION_MAP[role].includes(permission);
    },
  };
}

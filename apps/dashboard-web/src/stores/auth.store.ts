import { create } from "zustand";

export type UserRole = "owner" | "admin" | "operator" | "analyst";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  tenantId: string;
  role: UserRole;
  setUser: (user: AuthUser | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: {
    id: "demo-user-1",
    name: "Demo Operator",
    email: "demo@ai-ops.local",
  },
  tenantId: "tenant-acme",
  role: "operator",
  setUser: (user) => set({ user }),
}));

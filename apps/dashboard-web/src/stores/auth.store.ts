import { create } from "zustand";

export type UserRole = "owner" | "admin" | "operator" | "analyst";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthSnapshot {
  user: AuthUser;
  token: string;
  tenantId: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  tenantId: string | null;
  role: UserRole | null;
  setUser: (user: AuthUser | null) => void;
  setAuth: (snapshot: AuthSnapshot) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  tenantId: null,
  role: null,
  setUser: (user) => set({ user }),
  setAuth: ({ user, token, tenantId, role }) => set({ user, token, tenantId, role }),
  logout: () => set({ user: null, token: null, tenantId: null, role: null }),
}));

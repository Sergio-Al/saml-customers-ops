import { create } from "zustand";
import type { Tenant } from "@ai-ops/shared-types";

interface TenantState {
  activeTenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
}

export const useTenant = create<TenantState>((set) => ({
  activeTenant: null,
  setTenant: (tenant) => set({ activeTenant: tenant }),
}));

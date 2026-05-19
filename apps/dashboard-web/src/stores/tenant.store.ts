import { create } from "zustand";
import type { Tenant } from "@ai-ops/shared-types";

interface TenantState {
  activeTenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
}

const DEMO_TENANT: Tenant = {
  id: "tenant-acme",
  slug: "acme",
  name: "Acme Corp",
  plan: "growth",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useTenant = create<TenantState>((set) => ({
  activeTenant: DEMO_TENANT,
  setTenant: (tenant) => set({ activeTenant: tenant }),
}));

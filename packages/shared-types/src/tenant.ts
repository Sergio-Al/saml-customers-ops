/**
 * Tenant: the top-level isolation boundary in the platform.
 * All resources, events, and user actions are scoped to a tenant.
 */
export interface Tenant {
  id: string;
  slug: string;
  name: string;
  plan: TenantPlan;
  createdAt: string;
  updatedAt: string;
}

export type TenantPlan = "free" | "starter" | "growth" | "enterprise";

/**
 * Per-tenant feature flags and configuration.
 * Used for feature gating and per-tenant customization.
 */
export interface TenantConfig {
  tenantId: string;
  features: Record<string, boolean>;
  limits: TenantLimits;
}

export interface TenantLimits {
  maxUsers: number;
  maxWorkflows: number;
  aiRequestsPerMonth: number;
  eventsPerMinute: number;
}

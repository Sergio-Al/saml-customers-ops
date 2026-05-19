/**
 * Platform user. Always scoped to one or more tenants via TenantMembership.
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Roles within a tenant. RBAC is enforced at the service boundary.
 */
export const Role = {
  Owner: "owner",
  Admin: "admin",
  Operator: "operator",
  Analyst: "analyst",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/**
 * Membership linking a user to a tenant with a specific role.
 */
export interface TenantMembership {
  userId: string;
  tenantId: string;
  role: Role;
  createdAt: string;
}

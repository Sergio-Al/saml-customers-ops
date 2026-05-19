import { Injectable, Logger } from "@nestjs/common";
import type { Role } from "@ai-ops/shared-types";

interface CreateTenantResponse {
  tenant: { id: string; slug: string; name: string; plan: string };
  membership: { userId: string; tenantId: string; role: Role };
}

interface MembershipResponse {
  tenantId: string;
  role: Role;
}

/**
 * Thin HTTP client for tenant-service.
 * In Phase 4 this becomes an event-bus message; for Phase 3 we keep a direct call.
 */
@Injectable()
export class TenantClient {
  private readonly logger = new Logger(TenantClient.name);
  private readonly baseUrl: string;
  private readonly serviceSecret: string;

  constructor() {
    this.baseUrl = (process.env.TENANT_SERVICE_URL ?? "http://localhost:3002").replace(/\/$/, "");
    this.serviceSecret = process.env.JWT_SECRET ?? "";
  }

  async createTenantForUser(input: {
    userId: string;
    slug: string;
    name: string;
    email: string;
  }): Promise<CreateTenantResponse> {
    const res = await fetch(`${this.baseUrl}/internal/tenants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Service-Secret": this.serviceSecret,
      },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      this.logger.error(`tenant-service createTenant failed: ${res.status} ${text}`);
      throw new Error(`tenant-service createTenant failed: ${res.status}`);
    }
    return (await res.json()) as CreateTenantResponse;
  }

  async getPrimaryMembership(userId: string): Promise<MembershipResponse | null> {
    const res = await fetch(`${this.baseUrl}/internal/users/${userId}/primary-membership`, {
      method: "GET",
      headers: { "X-Service-Secret": this.serviceSecret },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      this.logger.error(`tenant-service primaryMembership failed: ${res.status} ${text}`);
      throw new Error(`tenant-service primaryMembership failed: ${res.status}`);
    }
    return (await res.json()) as MembershipResponse;
  }
}

import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  MembershipRole as PrismaMembershipRole,
  Tenant as PrismaTenant,
  TenantMembership as PrismaMembership,
} from "../../node_modules/.prisma/tenant-client";
import type { Role, Tenant, TenantMembership } from "@ai-ops/shared-types";
import { PrismaService } from "../prisma/prisma.module";

@Injectable()
export class TenantService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createTenantForUser(input: {
    userId: string;
    slug: string;
    name: string;
    email: string;
  }): Promise<{ tenant: Tenant; membership: TenantMembership }> {
    const existing = await this.prisma.tenant.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new ConflictException(`Tenant slug "${input.slug}" already taken`);
    }
    const tenant = await this.prisma.tenant.create({
      data: { slug: input.slug, name: input.name },
    });
    const membership = await this.prisma.tenantMembership.create({
      data: {
        userId: input.userId,
        tenantId: tenant.id,
        role: "owner",
        email: input.email,
      },
    });
    return { tenant: this.toTenant(tenant), membership: this.toMembership(membership) };
  }

  async getPrimaryMembership(userId: string): Promise<TenantMembership | null> {
    const row = await this.prisma.tenantMembership.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return row ? this.toMembership(row) : null;
  }

  async getTenant(tenantId: string, requestingUserId: string): Promise<Tenant> {
    await this.assertMembership(tenantId, requestingUserId);
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException("Tenant not found");
    return this.toTenant(tenant);
  }

  async listForUser(userId: string): Promise<Tenant[]> {
    const memberships = await this.prisma.tenantMembership.findMany({
      where: { userId },
      include: { tenant: true },
      orderBy: { createdAt: "asc" },
    });
    return memberships.map((m) => this.toTenant(m.tenant));
  }

  async listMembers(tenantId: string, requestingUserId: string): Promise<TenantMembership[]> {
    const me = await this.assertMembership(tenantId, requestingUserId);
    if (me.role !== "owner" && me.role !== "admin") {
      throw new ForbiddenException("Insufficient role to list members");
    }
    const rows = await this.prisma.tenantMembership.findMany({
      where: { tenantId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((r) => this.toMembership(r));
  }

  async inviteMember(
    tenantId: string,
    requestingUserId: string,
    input: { userId: string; email: string; role: Role },
  ): Promise<TenantMembership> {
    const me = await this.assertMembership(tenantId, requestingUserId);
    if (me.role !== "owner" && me.role !== "admin") {
      throw new ForbiddenException("Insufficient role to invite");
    }
    const existing = await this.prisma.tenantMembership.findUnique({
      where: { userId_tenantId: { userId: input.userId, tenantId } },
    });
    if (existing) {
      throw new ConflictException("User already a member");
    }
    const row = await this.prisma.tenantMembership.create({
      data: {
        userId: input.userId,
        tenantId,
        role: input.role as PrismaMembershipRole,
        email: input.email,
      },
    });
    return this.toMembership(row);
  }

  private async assertMembership(tenantId: string, userId: string): Promise<TenantMembership> {
    const row = await this.prisma.tenantMembership.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
    });
    if (!row) throw new ForbiddenException("Not a member of this tenant");
    return this.toMembership(row);
  }

  private toTenant(row: PrismaTenant): Tenant {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      plan: row.plan,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private toMembership(row: PrismaMembership): TenantMembership {
    return {
      userId: row.userId,
      tenantId: row.tenantId,
      role: row.role as Role,
      createdAt: row.createdAt.toISOString(),
    };
  }
}

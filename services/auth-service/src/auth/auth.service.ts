import { createHash, randomBytes } from "node:crypto";
import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import type { IIdentityProvider, TokenPair } from "@ai-ops/auth-sdk";
import type { Role, User } from "@ai-ops/shared-types";
import { PrismaService } from "../prisma/prisma.module";
import { IDENTITY_PROVIDER } from "../provider/provider.module";
import { TenantClient } from "./tenant.client";
import type { LoginDto, RegisterDto } from "./dto";

const BCRYPT_ROUNDS = 12;
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || `t-${randomBytes(4).toString("hex")}`
  );
}

export interface AuthResult {
  user: User;
  tenantId: string;
  role: Role;
  tokens: TokenPair;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(TenantClient) private readonly tenants: TenantClient,
    @Inject(IDENTITY_PROVIDER) private readonly identity: IIdentityProvider,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("Email already registered");
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        displayName: dto.displayName,
      },
    });

    const slug = dto.tenantSlug ?? slugify(dto.email.split("@")[1] ?? dto.displayName);
    const name = dto.tenantName ?? slug.replace(/-/g, " ");
    const { tenant, membership } = await this.tenants.createTenantForUser({
      userId: user.id,
      slug,
      name,
      email: user.email,
    });

    const tokens = await this.issueAndPersistTokens({
      userId: user.id,
      tenantId: tenant.id,
      role: membership.role,
      email: user.email,
    });

    return {
      user: this.toUser(user),
      tenantId: tenant.id,
      role: membership.role,
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const membership = await this.tenants.getPrimaryMembership(user.id);
    if (!membership) {
      throw new UnauthorizedException("No tenant membership");
    }
    const tokens = await this.issueAndPersistTokens({
      userId: user.id,
      tenantId: membership.tenantId,
      role: membership.role,
      email: user.email,
    });
    return {
      user: this.toUser(user),
      tenantId: membership.tenantId,
      role: membership.role,
      tokens,
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token invalid or expired");
    }

    let pair: TokenPair;
    try {
      pair = await this.identity.refresh(refreshToken);
    } catch {
      // Defense-in-depth: if signature/expiry fails at the provider level, revoke.
      await this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException("Refresh token invalid");
    }

    // Rotate: revoke old, persist new.
    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      }),
      this.prisma.refreshToken.create({
        data: {
          userId: stored.userId,
          tokenHash: hashToken(pair.refreshToken),
          expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
        },
      }),
    ]);

    return pair;
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken
      .update({ where: { tokenHash }, data: { revokedAt: new Date() } })
      .catch((err: unknown) => {
        this.logger.debug(`logout: token not found (${(err as Error).message})`);
      });
  }

  async getMe(userId: string): Promise<{ user: User; tenantId: string; role: Role } | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    const membership = await this.tenants.getPrimaryMembership(userId);
    if (!membership) return null;
    return {
      user: this.toUser(user),
      tenantId: membership.tenantId,
      role: membership.role,
    };
  }

  private async issueAndPersistTokens(claims: {
    userId: string;
    tenantId: string;
    role: Role;
    email: string;
  }): Promise<TokenPair> {
    const pair = await this.identity.issueToken(claims);
    await this.prisma.refreshToken.create({
      data: {
        userId: claims.userId,
        tokenHash: hashToken(pair.refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
      },
    });
    return pair;
  }

  private toUser(row: {
    id: string;
    email: string;
    displayName: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return {
      id: row.id,
      email: row.email,
      displayName: row.displayName,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

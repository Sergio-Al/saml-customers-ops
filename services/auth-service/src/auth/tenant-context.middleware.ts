import type { NextFunction, Response } from "express";
import { ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { AuthContext, IIdentityProvider } from "@ai-ops/auth-sdk";
import type { Request } from "express";
import { IDENTITY_PROVIDER } from "../provider/provider.module";

export interface TenantContextRequest extends Request {
  auth?: AuthContext;
  tenantId?: string;
}

@Injectable()
export class TenantContextMiddleware {
  constructor(@Inject(IDENTITY_PROVIDER) private readonly identity: IIdentityProvider) {}

  async use(req: TenantContextRequest, _res: Response, next: NextFunction): Promise<void> {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing Bearer token");
    }

    const token = header.slice("Bearer ".length).trim();
    let auth: AuthContext;
    try {
      auth = await this.identity.verifyToken(token);
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    const headerTenant = req.headers["x-tenant-id"];
    const tenantFromHeader = Array.isArray(headerTenant) ? headerTenant[0] : headerTenant;
    if (tenantFromHeader && tenantFromHeader !== auth.tenantId) {
      throw new ForbiddenException("X-Tenant-Id does not match token tenant");
    }

    req.auth = auth;
    req.tenantId = auth.tenantId;
    next();
  }
}

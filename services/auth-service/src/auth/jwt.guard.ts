import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import type { AuthContext, IIdentityProvider } from "@ai-ops/auth-sdk";
import { IDENTITY_PROVIDER } from "../provider/provider.module";

export interface AuthedRequest extends Request {
  auth?: AuthContext;
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(@Inject(IDENTITY_PROVIDER) private readonly identity: IIdentityProvider) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing Bearer token");
    }
    const token = header.slice("Bearer ".length).trim();
    try {
      req.auth = await this.identity.verifyToken(token);
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}

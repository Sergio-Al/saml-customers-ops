import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";

/**
 * Internal service-to-service auth.
 * Currently a shared secret (X-Service-Secret) matching JWT_SECRET.
 * Phase 4+ replaces this with signed service tokens / event bus.
 */
@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const provided = req.header("X-Service-Secret");
    const expected = process.env.JWT_SECRET;
    if (!expected || !provided || provided !== expected) {
      throw new UnauthorizedException("Invalid internal service credential");
    }
    return true;
  }
}

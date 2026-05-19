import { Module, RequestMethod } from "@nestjs/common";
import type { MiddlewareConsumer, NestModule } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtGuard } from "./jwt.guard";
import { TenantClient } from "./tenant.client";
import { TenantContextMiddleware } from "./tenant-context.middleware";

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtGuard, TenantClient, TenantContextMiddleware],
  exports: [AuthService, JwtGuard],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TenantContextMiddleware)
      .forRoutes({ path: "auth/me", method: RequestMethod.GET });
  }
}

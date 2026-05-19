import { Module } from "@nestjs/common";
import { InternalGuard } from "./internal.guard";
import { JwtGuard } from "./jwt.guard";
import { TenantController } from "./tenant.controller";
import { TenantService } from "./tenant.service";

@Module({
  controllers: [TenantController],
  providers: [TenantService, JwtGuard, InternalGuard],
  exports: [TenantService, JwtGuard],
})
export class TenantModule {}

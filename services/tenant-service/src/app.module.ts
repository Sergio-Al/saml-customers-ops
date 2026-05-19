import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { ProviderModule } from "./provider/provider.module";
import { TenantModule } from "./tenant/tenant.module";

@Module({
  imports: [PrismaModule, ProviderModule, TenantModule],
})
export class AppModule {}

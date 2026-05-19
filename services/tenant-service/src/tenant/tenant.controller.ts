import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { CreateTenantInternalDto, InviteMemberDto } from "./dto";
import { InternalGuard } from "./internal.guard";
import { JwtGuard, type AuthedRequest } from "./jwt.guard";
import { TenantService } from "./tenant.service";

@Controller()
export class TenantController {
  constructor(@Inject(TenantService) private readonly tenants: TenantService) {}

  // ---- public (JWT-protected) ----

  @Get("tenants/me")
  @UseGuards(JwtGuard)
  async listMine(@Req() req: AuthedRequest) {
    return this.tenants.listForUser(req.auth!.userId);
  }

  @Get("tenants/:id")
  @UseGuards(JwtGuard)
  async getOne(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.tenants.getTenant(id, req.auth!.userId);
  }

  @Get("tenants/:id/members")
  @UseGuards(JwtGuard)
  async listMembers(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.tenants.listMembers(id, req.auth!.userId);
  }

  @Post("tenants/:id/members")
  @UseGuards(JwtGuard)
  async invite(@Req() req: AuthedRequest, @Param("id") id: string, @Body() dto: InviteMemberDto) {
    return this.tenants.inviteMember(id, req.auth!.userId, {
      userId: dto.userId,
      email: dto.email,
      role: dto.role,
    });
  }

  // ---- internal (service-to-service) ----

  @Post("internal/tenants")
  @UseGuards(InternalGuard)
  async createInternal(@Body() dto: CreateTenantInternalDto) {
    return this.tenants.createTenantForUser({
      userId: dto.userId,
      slug: dto.slug,
      name: dto.name,
      email: dto.email,
    });
  }

  @Get("internal/users/:userId/primary-membership")
  @UseGuards(InternalGuard)
  async primaryMembershipInternal(@Param("userId") userId: string) {
    const m = await this.tenants.getPrimaryMembership(userId);
    if (!m) throw new NotFoundException("No membership");
    return m;
  }
}

import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "@ai-ops/shared-types";

export class CreateTenantInternalDto {
  @IsString()
  @MinLength(1)
  userId!: string;

  @IsString()
  @MinLength(1)
  slug!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;
}

export class InviteMemberDto {
  @IsString()
  @MinLength(1)
  userId!: string;

  @IsEmail()
  email!: string;

  @IsEnum(Role)
  role!: Role;
}

export class UpdateMemberRoleDto {
  @IsEnum(Role)
  role!: Role;
}

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;
}

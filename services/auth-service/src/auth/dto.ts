import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  displayName!: string;

  /** Optional tenant slug; if absent a new tenant is created from the email domain. */
  @IsOptional()
  @IsString()
  tenantSlug?: string;

  /** Optional tenant name; if absent derived from slug. */
  @IsOptional()
  @IsString()
  tenantName?: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class RefreshDto {
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}

export class LogoutDto {
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}

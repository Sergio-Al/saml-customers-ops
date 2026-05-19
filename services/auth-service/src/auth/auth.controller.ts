import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
// Must be runtime imports so class-validator metadata exists for ValidationPipe.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { LoginDto, LogoutDto, RefreshDto, RegisterDto } from "./dto";
import { JwtGuard, type AuthedRequest } from "./jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: LogoutDto): Promise<void> {
    await this.auth.logout(dto.refreshToken);
  }

  @Get("me")
  @UseGuards(JwtGuard)
  async me(@Req() req: AuthedRequest) {
    const ctx = req.auth!;
    const me = await this.auth.getMe(ctx.userId);
    if (!me) throw new NotFoundException("User no longer exists");
    return me;
  }
}

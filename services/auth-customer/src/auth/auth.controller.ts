import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Req,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import type { FastifyReply } from 'fastify/types/reply';
import type { FastifyRequest } from 'fastify/types/request';
import { ConfigService } from '@nestjs/config';
import { buildRefreshCookieBase } from './helpers/auth-response.factory';
import { JwtPayload } from 'src/common/contracts/jwt/jwt-payload.types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { user, accessToken, refreshCookie } =
      await this.authService.register(registerDto);

    res.setCookie(
      refreshCookie.name,
      refreshCookie.value,
      refreshCookie.options,
    );

    return { user, accessToken };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { user, accessToken, refreshCookie } =
      await this.authService.login(loginDto);

    res.setCookie(
      refreshCookie.name,
      refreshCookie.value,
      refreshCookie.options,
    );

    return { user, accessToken };
  }

  @Post('refresh')
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const gettedRefreshToken = (
      req.cookies as Record<string, string> | undefined
    )?.refreshToken;
    if (!gettedRefreshToken)
      throw new UnauthorizedException('No refresh token');

    const { user, accessToken, refreshCookie } =
      await this.authService.refresh(gettedRefreshToken);

    res.setCookie(
      refreshCookie.name,
      refreshCookie.value,
      refreshCookie.options,
    );

    return { user, accessToken };
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const gettedRefreshToken = (
      req.cookies as Record<string, string> | undefined
    )?.refreshToken;

    if (gettedRefreshToken) await this.authService.logout(gettedRefreshToken);

    res.clearCookie('refreshToken', buildRefreshCookieBase(this.config));

    return;
  }

  @Post('logout-all')
  @HttpCode(204)
  async logoutAll(
    @Req() req: FastifyRequest & { user: JwtPayload },
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const userId = req.user.sub;

    await this.authService.logoutAll(userId);

    res.clearCookie('refreshToken', buildRefreshCookieBase(this.config));

    return;
  }

  @Get()
  me() {}
}

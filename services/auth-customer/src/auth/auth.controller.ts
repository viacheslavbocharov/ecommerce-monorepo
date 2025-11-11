import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import type { FastifyReply } from 'fastify/types/reply';
import type { FastifyRequest } from 'fastify/types/request';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  logout() {}

  @Get()
  me() {}
}

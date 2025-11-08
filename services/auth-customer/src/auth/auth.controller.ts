import { Controller, Post, Body, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefresfDto } from './dto/refresh.dto';
import type { FastifyReply } from 'fastify/types/reply';

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
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  refresh(@Body() refreshDto: RefresfDto) {
    return this.authService.refresh(refreshDto);
  }

  @Post('logout')
  logout() {}

  @Get()
  me() {}
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ProxyHelper } from '../common/proxy.helper';

@Controller('auth')
export class AuthGatewayController {
  private proxy: ProxyHelper;

  constructor(config: ConfigService) {
    this.proxy = new ProxyHelper(config);
  }

  @Post('register')
  async register(
    @Body() body: any,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return this.proxy.forwardJson(req, res, '/auth/register', {
      method: 'POST',
      body,
    });
  }

  @Post('login')
  async login(
    @Body() body: any,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return this.proxy.forwardJson(req, res, '/auth/login', {
      method: 'POST',
      body,
    });
  }

  @Post('refresh')
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return this.proxy.forwardJson(req, res, '/auth/refresh', {
      method: 'POST',
    });
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    await this.proxy.forwardNoBody(req, res, '/auth/logout', {
      method: 'POST',
    });
  }

  @Post('logout-all')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    await this.proxy.forwardNoBody(req, res, '/auth/logout-all', {
      method: 'POST',
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: FastifyRequest) {
    return this.proxy.forwardJson(req, {} as FastifyReply, '/auth/me');
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProxyHelper } from '../common/proxy.helper';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UsersMeGatewayController {
  private proxy: ProxyHelper;

  constructor(config: ConfigService) {
    this.proxy = new ProxyHelper(config);
  }

  @Get()
  async getMe(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return this.proxy.forwardJson(req, res, '/users/me', {
      method: 'GET',
    });
  }

  @Patch()
  async updateMe(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() dto: any,
  ) {
    return this.proxy.forwardJson(req, res, '/users/me', {
      method: 'PATCH',
      body: dto,
    });
  }

  @Patch('change-password')
  async changePassword(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() dto: any,
  ) {
    return this.proxy.forwardJson(req, res, '/users/me/change-password', {
      method: 'PATCH',
      body: dto,
    });
  }

  @Delete()
  async remove(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return this.proxy.forwardJson(req, res, '/users/me', {
      method: 'DELETE',
    });
  }
}

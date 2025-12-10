import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ProxyHelper } from '../common/proxy.helper';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class AdminUsersGatewayController {
  private proxy: ProxyHelper;

  constructor(config: ConfigService) {
    this.proxy = new ProxyHelper(config);
  }

  @Post()
  async create(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() dto: any,
  ) {
    return this.proxy.forwardJson(req, res, '/admin/users', {
      method: 'POST',
      body: dto,
    });
  }

  @Get()
  async findMany(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return this.proxy.forwardJson(req, res, '/admin/users', {
      method: 'GET',
    });
  }

  @Get(':id')
  async findOne(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @Param('id') id: string,
  ) {
    return this.proxy.forwardJson(req, res, `/admin/users/${id}`, {
      method: 'GET',
    });
  }

  @Patch(':id')
  async update(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.proxy.forwardJson(req, res, `/admin/users/${id}`, {
      method: 'PATCH',
      body: dto,
    });
  }

  @Patch(':id/change-password')
  async changePassword(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.proxy.forwardJson(
      req,
      res,
      `/admin/users/${id}/change-password`,
      {
        method: 'PATCH',
        body: dto,
      },
    );
  }

  @Delete(':id')
  async remove(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @Param('id') id: string,
  ) {
    return this.proxy.forwardJson(req, res, `/admin/users/${id}`, {
      method: 'DELETE',
    });
  }
}

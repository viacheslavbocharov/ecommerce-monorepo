import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import type { FastifyRequest } from 'fastify';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users/me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getMe(@Req() req: FastifyRequest) {
    if (!req.user) throw new UnauthorizedException();

    return this.usersService.findById(req.user.sub);
  }

  @Patch()
  updateMe(@Req() req: FastifyRequest, @Body() dto: UpdateProfileDto) {
    if (!req.user) throw new UnauthorizedException();

    return this.usersService.updateProfile(req.user.sub, dto);
  }

  @Patch('change-password')
  changePasswordMe(@Req() req: FastifyRequest, dto: ChangePasswordDto) {
    if (!req.user) throw new UnauthorizedException();

    return this.usersService.changePassword(req.user.sub, dto);
  }

  @Delete()
  removeMe(@Req() req: FastifyRequest) {
    if (!req.user) throw new UnauthorizedException();

    return this.usersService.removeMe(req.user.sub);
  }
}

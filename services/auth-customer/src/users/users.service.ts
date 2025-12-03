import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { publicUserSelect } from 'src/common/contracts/user/public-user.select';
import * as argon2 from 'argon2';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { Prisma } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async adminCreateUser(dto: AdminCreateUserDto) {
    const exist = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exist)
      throw new ConflictException('User with this email already exists');

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    const publicUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: passwordHash,
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            ...(dto.phone && { phone: dto.phone }),
          },
        },
      },
      select: publicUserSelect,
    });

    return publicUser;
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id: id },
      select: publicUserSelect,
    });
  }

  async findMany() {
    return this.prisma.user.findMany({
      include: publicUserSelect,
    });
  }

  async adminUpdateUser(id: string, dto: AdminUpdateUserDto) {
    const exist = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!exist) throw new NotFoundException('User with this id does not exist');

    const { firstName, lastName, phone, ...userData } = dto;

    const hasProfileData =
      firstName !== undefined || lastName !== undefined || phone !== undefined;

    const data = {
      ...userData,
      ...(hasProfileData && {
        profile: {
          upsert: {
            create: {
              ...(firstName !== undefined && { firstName }),
              ...(lastName !== undefined && { lastName }),
              ...(phone !== undefined && { phone }),
            },
            update: {
              ...(firstName !== undefined && { firstName }),
              ...(lastName !== undefined && { lastName }),
              ...(phone !== undefined && { phone }),
            },
          },
        },
      }),
    } as Prisma.UserUpdateInput;

    return await this.prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const exist = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!exist) throw new NotFoundException('User with this id does not exist');

    const { firstName, lastName, phone } = dto;

    const hasProfileData =
      firstName !== undefined || lastName !== undefined || phone !== undefined;

    const data = {
      ...(hasProfileData && {
        profile: {
          upsert: {
            create: {
              ...(firstName !== undefined && { firstName }),
              ...(lastName !== undefined && { lastName }),
              ...(phone !== undefined && { phone }),
            },
            update: {
              ...(firstName !== undefined && { firstName }),
              ...(lastName !== undefined && { lastName }),
              ...(phone !== undefined && { phone }),
            },
          },
        },
      }),
    } as Prisma.UserUpdateInput;

    return await this.prisma.user.update({
      where: { id: userId },
      data,
      select: publicUserSelect,
    });
  }

  async adminChangePassword(id: string, newPassword: string) {
    const exist = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!exist) throw new NotFoundException('User with this id does not exist');

    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });

    return await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: publicUserSelect,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User with this id does not exist');

    const isValide = await argon2.verify(
      user.passwordHash,
      dto.currentPassword,
    );

    if (!isValide)
      throw new BadRequestException('Current password is incorrect');

    if (dto.currentPassword === dto.newPassword)
      throw new BadRequestException('New password must me different');

    return this.adminChangePassword(userId, dto.newPassword);
  }

  async adminRemoveUser(id: string) {
    const exist = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!exist) {
      throw new NotFoundException('User with this id does not exist');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { success: true };
  }

  async removeMe(userId: string) {
    await this.adminRemoveUser(userId);
  }
}

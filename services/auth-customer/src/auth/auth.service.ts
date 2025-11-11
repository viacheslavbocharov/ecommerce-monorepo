import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaClient } from 'src/generated/prisma/client';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import { publicUserSelect } from 'src/common/contracts/user/public-user.select';
import { buildAuthResponse } from './helpers/auth-response.factory';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly config: ConfigService,
    private readonly token: TokenService,
    private readonly jwt: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const exist = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (exist) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await argon2.hash(registerDto.password, {
      type: argon2.argon2id,
    });

    const publicUser = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash: passwordHash,
        profile: {
          create: {
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            ...(registerDto.phone && { phone: registerDto.phone }),
          },
        },
      },
      select: publicUserSelect,
    });

    const { accessToken, refreshToken } = await this.token.createTokens({
      sub: publicUser.id,
      role: publicUser.role,
    });

    return buildAuthResponse({
      config: this.config,
      user: publicUser,
      accessToken,
      refreshToken,
    });
  }

  async login(loginDto: LoginDto) {
    const publicUserSelectWithPassword = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      select: {
        ...publicUserSelect,
        passwordHash: true,
      } as const,
    });

    if (!publicUserSelectWithPassword) {
      throw new NotFoundException('Invalid email');
    }

    const { passwordHash, ...publicUser } = publicUserSelectWithPassword;

    const isPasswordMatch = await argon2.verify(passwordHash, loginDto.email);

    if (isPasswordMatch) {
      const { accessToken, refreshToken } = await this.token.createTokens({
        sub: publicUser.id,
        role: publicUser.role,
      });
      return buildAuthResponse({
        config: this.config,
        user: publicUser,
        accessToken,
        refreshToken,
      });
    } else {
      throw new UnauthorizedException('Invalid password');
    }
  }

  async refresh(gettedRefreshToken: string) {
    const payload = await this.token.validateRefreshToken(gettedRefreshToken);

    const { accessToken, refreshToken } = await this.token.createTokens({
      sub: payload.sub,
      role: payload.role,
    });

    const newPayload = await this.token.validateRefreshToken(refreshToken);

    await this.prisma.refreshToken.update({
      where: { jti: payload.jti },
      data: { revoked: true, replacedBy: newPayload.jti },
    });

    const publicUser = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: publicUserSelect,
    });

    if (!publicUser) {
      throw new UnauthorizedException('User not found');
    }

    return buildAuthResponse({
      config: this.config,
      user: publicUser,
      accessToken,
      refreshToken,
    });
  }

  // logout(refreshToken) {}

  // me(userId) {}
}

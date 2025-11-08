import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { PrismaClient } from 'src/generated/prisma/client';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly config: ConfigService,
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

    const user = await this.prisma.user.create({
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
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    const jti = crypto.randomUUID();
    const refreshExpiresAt = new Date(
      Date.now() +
        Number(this.config.get<string>('JWT_REFRESH_TTL', '2592000')) * 1000,
    );

    await this.prisma.refreshToken.create({
      data: {
        jti,
        userId: user.id,
        expiresAt: refreshExpiresAt,
      },
    });

    const accessToken = this.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: Number(this.config.get<string>('JWT_ACCESS_TTL') ?? '900') },
    );

    const refreshToken = this.jwt.sign(
      { sub: user.id, role: user.role, jti },
      {
        expiresIn: Number(
          this.config.get<string>('JWT_REFRESH_TTL') ?? '2592000',
        ),
      },
    );

    return {
      user,
      accessToken,
      refreshCookie: {
        name: 'refreshToken',
        value: refreshToken,
        options: {
          httpOnly: true,
          secure: this.config.get('NODE_ENV') === 'production',
          sameSite:
            this.config.get('NODE_ENV') === 'production' ? 'none' : 'lax',
          path: '/',
          maxAge: Number(
            this.config.get<string>('JWT_REFRESH_TTL') ?? '2592000',
          ),
        } as const,
      },
    };
  }

  login(loginDto: LoginDto) {}

  refresh(refreshToken) {}

  logout(refreshToken) {}

  me(userId) {}
}

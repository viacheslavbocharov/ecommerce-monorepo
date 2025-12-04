import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';
import { JwtRefreshPayload } from '@ecommerce/shared-contracts/jwt/jwt-payload.types';
import { UserRole } from '@ecommerce/shared-contracts/auth/user-role.type';

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async createTokens(user: { sub: string; role: UserRole }) {
    const jti = crypto.randomUUID();

    const refreshExpiresAt = new Date(
      Date.now() +
        Number(this.config.get<string>('JWT_REFRESH_TTL', '2592000')) * 1000,
    );

    await this.prisma.refreshToken.create({
      data: {
        jti,
        userId: user.sub,
        expiresAt: refreshExpiresAt,
      },
    });

    const accessToken = await this.jwt.signAsync(
      { sub: user.sub, role: user.role, type: 'access' },
      { expiresIn: Number(this.config.get<string>('JWT_ACCESS_TTL') ?? '900') },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: user.sub, role: user.role, jti, type: 'refresh' },
      {
        expiresIn: Number(
          this.config.get<string>('JWT_REFRESH_TTL') ?? '2592000',
        ),
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(refreshToken: string): Promise<JwtRefreshPayload> {
    let payload: JwtRefreshPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtRefreshPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!payload || !payload.sub || !payload.jti) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const session = await this.prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
    });
    if (!session) throw new UnauthorizedException('No such refresh token');
    if (session.userId !== payload.sub)
      throw new UnauthorizedException('Token/user mismatch');
    if (session.revoked)
      throw new UnauthorizedException('Refresh token has been revoked');
    if (session.expiresAt <= new Date())
      throw new UnauthorizedException('Refresh token expired');

    return payload;
  }
}

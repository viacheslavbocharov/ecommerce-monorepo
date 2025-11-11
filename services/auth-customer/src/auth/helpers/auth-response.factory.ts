import { CookieSerializeOptions } from '@fastify/cookie';
import { ConfigService } from '@nestjs/config';
import { PublicUser } from 'src/common/contracts/user/public-user.type';

export interface TokenResponseOptions {
  config: ConfigService;
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export const buildRefreshCookieBase = (
  config: ConfigService,
): CookieSerializeOptions => {
  const isProd = config.get('NODE_ENV') === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  } as const;
};

export const buildAuthResponse = ({
  config,
  user,
  accessToken,
  refreshToken,
}: TokenResponseOptions) => {
  return {
    user,
    accessToken,
    refreshCookie: {
      name: 'refreshToken',
      value: refreshToken,
      options: {
        ...buildRefreshCookieBase(config),
        maxAge: Number(config.get<string>('JWT_REFRESH_TTL') ?? '2592000'),
      } as const,
    },
  };
};

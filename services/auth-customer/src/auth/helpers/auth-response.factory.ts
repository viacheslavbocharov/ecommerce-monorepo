import { ConfigService } from '@nestjs/config';
import { PublicUser } from 'src/common/contracts/user/public-user.type';

export interface TokenResponseOptions {
  config: ConfigService;
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export const buildAuthResponse = ({
  config,
  user,
  accessToken,
  refreshToken,
}: TokenResponseOptions) => {
  const isProd = config.get('NODE_ENV') === 'production';

  return {
    user,
    accessToken,
    refreshCookie: {
      name: 'refreshToken',
      value: refreshToken,
      options: {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        maxAge: Number(config.get<string>('JWT_REFRESH_TTL') ?? '2592000'),
      } as const,
    },
  };
};

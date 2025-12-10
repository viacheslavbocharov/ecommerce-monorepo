import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { JwtAccessPayload } from '@ecommerce/shared-contracts/jwt/jwt-payload.types';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const publicKeyPathFromEnv = config.get<string>('JWT_PUBLIC_KEY_PATH');

    if (!publicKeyPathFromEnv)
      throw new Error('JWT_PUBLIC_KEY_PATH is not set');

    const publicKeyPath = publicKeyPathFromEnv
      ? join(process.cwd(), publicKeyPathFromEnv)
      : join(process.cwd(), 'services', 'auth-customer', 'keys', 'public.pem');

    const publicKey = readFileSync(publicKeyPath, 'utf8');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
      issuer: config.get('JWT_ISSUER') ?? 'auth',
      audience: config.get('JWT_AUDIENCE') ?? 'api',
    });
  }

  validate(payload: JwtAccessPayload): JwtAccessPayload {
    return payload;
  }
}

import 'fastify';
import { JwtPayload } from '../common/contracts/jwt/jwt-payload.types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

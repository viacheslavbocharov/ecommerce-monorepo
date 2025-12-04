import 'fastify';
import { JwtAccessPayload } from '../common/contracts/jwt/jwt-payload.types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtAccessPayload;
  }
}

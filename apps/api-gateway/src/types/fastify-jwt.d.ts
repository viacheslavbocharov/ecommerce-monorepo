import 'fastify';
import { JwtAccessPayload } from '@ecommerce/shared-contracts/jwt/jwt-payload.types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtAccessPayload;
  }
}

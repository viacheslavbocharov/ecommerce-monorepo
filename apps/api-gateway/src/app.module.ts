import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtAccessStrategy } from './auth/jwt.strategy';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './roles/roles.guard';
import { AuthGatewayController } from './auth/auth-gateway.controller';
import { UsersMeGatewayController } from './users/users-me-gateway.controller';
import { AdminUsersGatewayController } from './admin/admin-users-gateway.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [
    AuthGatewayController,
    UsersMeGatewayController,
    AdminUsersGatewayController,
  ],
  providers: [JwtAccessStrategy, JwtAuthGuard, RolesGuard],
})
export class AppModule {}

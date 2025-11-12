import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const privateKeyPath =
          config.get<string>('JWT_PRIVATE_KEY_PATH') ??
          join(__dirname, '..', 'keys', 'private.pem');

        const publicKeyPath =
          config.get<string>('JWT_PUBLIC_KEY_PATH') ??
          join(__dirname, '..', 'keys', 'public.pem');

        const privateKey = readFileSync(privateKeyPath, 'utf8');
        const publicKey = readFileSync(publicKeyPath, 'utf8');

        return {
          privateKey,
          publicKey,
          signOptions: {
            algorithm: 'RS256',
            issuer: 'auth',
            audience: 'api',
          },
          verifyOptions: {
            algorithms: ['RS256'],
            issuer: 'auth',
            audience: 'api',
          },
        };
      },
    }),
    AuthModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: () => {
        const privateKey = readFileSync(
          join(__dirname, '..', 'keys', 'private.pem'),
          'utf8',
        );
        const publicKey = readFileSync(
          join(__dirname, '..', 'keys', 'public.pem'),
          'utf8',
        );

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

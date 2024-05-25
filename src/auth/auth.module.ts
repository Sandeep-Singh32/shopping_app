import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JWTAuthGuard } from 'src/guards/jwt.guard';
import { AuthService } from './auth.service';
import { Profile } from 'src/user/entities/profile.entity';
import { S3Service } from 'src/shared/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: '6h',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    JwtAuthStrategy,
    {
      provide: APP_GUARD,
      useClass: JWTAuthGuard,
    },
    AuthService,
    S3Service,
  ],
  exports: [JwtAuthStrategy, AuthService, JwtModule, S3Service],
})
export class AuthModule {}

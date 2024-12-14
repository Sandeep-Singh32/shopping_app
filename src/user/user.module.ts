import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Profile } from './entities/profile.entity';
import { CartEntity } from 'src/cart/entities/cart.entity';
import { S3Service } from 'src/shared/s3.service';
import { Product } from 'src/product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, CartEntity, Product])],
  controllers: [UserController],
  providers: [UserService, JwtService, S3Service],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { S3Service } from 'src/shared/s3.service';
import { RedisService } from 'src/shared/redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController],
  providers: [ProductService, S3Service, RedisService],
})
export class ProductModule {}

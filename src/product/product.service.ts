// product.service.ts

import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto, ProductQuery } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductCategory } from './entities/product.entity';
import { User } from '../user/entities/user.entity';
import { S3Service } from 'src/shared/s3.service';
import { RedisService } from 'src/shared/redis/redis.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ProductService {
  private readonly redisKeyPrefix = 'shopping';
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private s3Service: S3Service,
    private readonly redisService: RedisService,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    try {
      return await this.productRepository.find({});
    } catch (error) {
      throw new NotFoundException('Products not found');
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const result = await this.redisService.get<any>(id);
      console.log(result);

      if (result) {
        console.log('From redis found this product ---->', result);
        return result;
      }

      console.log('product not found in redis ---->', result);
      const product = await this.productRepository.findOneOrFail({
        where: { id },
      });
      this.redisService.set(id, product);
      return product;
    } catch (error) {
      throw new NotFoundException('Product not found');
    }
  }

  async getProductByCategory(
    category: ProductCategory,
    query?: ProductQuery,
  ): Promise<Product[]> {
    try {
      const repoQuery: {
        where?: Record<any, any>;
        take?: number;
        skip?: number;
      } = {
        where: { category },
      };

      if (query && query.limit) {
        repoQuery.take = query.limit;
      }

      if (query && query.skip) {
        repoQuery.skip = query.skip;
      }

      const product = await this.productRepository.find(repoQuery);

      if (!product || product.length === 0) {
        throw new NotFoundException('No products found for the given category');
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Something went wrong');
    }
  }

  async createProduct(
    createProductDto: CreateProductDto,
    user: User,
    file?: Express.Multer.File,
  ): Promise<any> {
    try {
      if (file) {
        const key = `products/${file.originalname}`;

        const uploadResult = await this.s3Service.uploadFileToS3(file, key);

        createProductDto.imageUrl = uploadResult;
      }

      createProductDto.owner = user;

      const product = this.productRepository.create(createProductDto);
      return await this.productRepository.save(product);
    } catch (error) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const product = await this.getProductById(id);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const updatedProduct = { ...product, ...updateProductDto };
      return this.productRepository.save(updatedProduct);
    } catch (error) {
      throw new NotFoundException('Product not found');
    }
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    try {
      const product = await this.getProductById(id);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      await this.productRepository.delete(id);
      return { message: 'Product deleted successfully' };
    } catch (error) {
      throw new NotFoundException('Product not found');
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkProductInventory() {
    console.log('Cron job is Checking inventory inside product service ...');
  }
}

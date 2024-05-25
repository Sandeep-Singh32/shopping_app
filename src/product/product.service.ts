// product.service.ts

import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { User } from '../user/entities/user.entity';
import { S3Service } from 'src/shared/s3.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private s3Service: S3Service,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    try {
      return await this.productRepository.find();
    } catch (error) {
      throw new NotFoundException('Products not found');
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const product = await this.productRepository.findOneOrFail({
        where: { id },
      });
      return product;
    } catch (error) {
      throw new NotFoundException('Product not found');
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
}

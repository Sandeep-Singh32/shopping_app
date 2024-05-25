// product.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, ProductQuery } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/guards/product.guard';
import { ProductRequiredRoles, Public } from 'src/guards/public.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserInfo } from 'src/user/decorators/user.decorator';
import { User } from 'src/user/entities/user.entity';
import { ProductCategory } from './entities/product.entity';

@ApiTags('products')
@UseGuards(RoleGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Public()
  @Get()
  async getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Public()
  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Public()
  @Get('/category/:categoryId')
  async getProductByCategory(
    @Param('categoryId') id: ProductCategory,
    @Query() query: ProductQuery,
  ) {
    return this.productService.getProductByCategory(id, query);
  }

  @ProductRequiredRoles()
  @Post()
  @UseInterceptors(FileInterceptor('imageUrl'))
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
    @UserInfo() user: User,
  ) {
    if (!user.id) {
      throw new NotFoundException('User not found');
    }
    return this.productService.createProduct(createProductDto, user, file);
  }

  @ProductRequiredRoles()
  @Put(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @ProductRequiredRoles()
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}

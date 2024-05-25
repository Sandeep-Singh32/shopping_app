// cart.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags } from '@nestjs/swagger';
import { AddProductToCartDto } from './dto/add-product-to-cart.dto';
import { ProductRequiredRoles } from 'src/guards/public.guard';
import { RoleGuard } from 'src/guards/product.guard';

@ApiTags('carts')
@Controller('carts')
export class CartController {
  constructor(
    @Inject('Cart_Service') private readonly cartService: CartService,
  ) {}

  @ProductRequiredRoles()
  @Get('/all')
  @UseGuards(RoleGuard)
  async getAllCarts() {
    return this.cartService.getAllCarts();
  }

  @Post(':id/products')
  async addProductToCart(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addProductToCartDto: AddProductToCartDto,
  ) {
    return this.cartService.addProductToCart(id, addProductToCartDto);
  }

  @Delete(':id/products/:productId')
  async removeProductFromCart(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.cartService.removeProductFromCart(id, productId);
  }
}

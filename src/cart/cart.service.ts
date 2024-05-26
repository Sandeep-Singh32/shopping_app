// cart.service.ts

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { Cart } from './cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
// import { AddProductToCartDto } from './dto/add-product-to-cart.dto';
import { User } from 'src/user/entities/user.entity';
import { Product } from 'src/product/entities/product.entity';
import { CartEntity } from './entities/cart.entity';
import { AddProductToCartDto } from './dto/add-product-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getCartById(id: string): Promise<CartEntity> {
    try {
      const cart = await this.cartRepository.findOne({
        where: { id },
        relations: ['products'],
      });
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }
      return cart;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve cart');
    }
  }

  async getAllCarts(): Promise<CartEntity[]> {
    try {
      const cart = await this.cartRepository.find({
        relations: ['user', 'products'],
      });
      if (!cart.length) {
        throw new NotFoundException('Cart not found for user');
      }
      return cart;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve user cart');
    }
  }

  async addProductToCart(
    cartId: string,
    addProductToCartDto: AddProductToCartDto,
  ): Promise<CartEntity> {
    try {
      const cart = await this.getCartById(cartId);
      const product = await this.productRepository.findOne({
        where: { id: addProductToCartDto.productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const existProductIndex = cart.products.findIndex(
        (product) => product.id === addProductToCartDto.productId,
      );
      if (existProductIndex !== -1) {
        cart.products[existProductIndex].totalQuantity += 1;
      } else {
        product.totalQuantity = 1;
        cart.products.push(product);
      }

      cart.totalPrice = Number(cart.totalPrice) + Number(product.price);

      return await this.cartRepository.save(cart);
    } catch (error) {
      throw new InternalServerErrorException('Failed to add product to cart');
    }
  }

  async removeProductFromCart(
    cartId: string,
    productId: string,
  ): Promise<CartEntity> {
    try {
      const cart = await this.getCartById(cartId);
      const productIndex = cart.products.findIndex(
        (product) => product.id === productId,
      );
      if (productIndex === -1) {
        throw new NotFoundException('Product not found in cart');
      } else if (cart.products[productIndex].totalQuantity > 1) {
        cart.products[productIndex].totalQuantity =
          Number(cart.products[productIndex].totalQuantity) - 1;
        cart.totalPrice =
          Number(cart.totalPrice) - Number(cart.products[productIndex].price);
        return await this.cartRepository.save(cart);
      } else {
        const [product] = cart.products.splice(productIndex, 1);
        cart.totalPrice = Number(cart.totalPrice) - Number(product.price);
        return await this.cartRepository.save(cart);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to remove product from cart',
      );
    }
  }
}

import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { Product } from 'src/product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity, Product])],
  controllers: [CartController],
  providers: [{ provide: 'Cart_Service', useClass: CartService }],
})
export class CartModule {}

import { Module, ValidationPipe } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { NotificationsModule } from './notifications/notifications.module';
import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { AddressModule } from './address/address.module';
import { CartModule } from './cart/cart.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    ProductModule,
    CategoryModule,
    NotificationsModule,
    AddressModule,
    CartModule,
    ChatModule,
  ],
  controllers: [],
  providers: [{ provide: APP_PIPE, useClass: ValidationPipe }],
})
export class AppModule {}

import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddProductToCartDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;
}

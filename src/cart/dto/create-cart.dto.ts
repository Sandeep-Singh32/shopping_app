import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCartDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  quantity: string;
}

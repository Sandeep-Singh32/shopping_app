// import { File } from 'buffer';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ProductCategory } from '../entities/product.entity';
import { User } from 'src/user/entities/user.entity';

export class ProductQuery {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  skip: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  limit: number;
}

export class CreateProductDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0.01)
  price: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  owner: User;

  @IsNotEmpty()
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsOptional()
  isActive?: boolean;
}

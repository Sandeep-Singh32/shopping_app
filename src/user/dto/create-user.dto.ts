import { IsNotEmpty, IsString } from '@nestjs/class-validator';
import { OmitType } from '@nestjs/swagger';
import { MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class LoginUserDto extends OmitType(CreateUserDto, ['name'] as const) {}

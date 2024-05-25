import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional } from '@nestjs/class-validator';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { GenderType, UserStatus } from '../entities/profile.entity';
import { Transform } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  age: number;

  @IsOptional()
  @IsEnum(UserStatus)
  status: UserStatus;

  @IsOptional()
  @IsEnum(GenderType)
  gender: GenderType;

  @IsOptional()
  @IsString()
  profileImage: string;

  @IsOptional()
  @Transform(({ value }) => (value === 'true' || value === true ? true : false))
  isArchive: boolean;
}

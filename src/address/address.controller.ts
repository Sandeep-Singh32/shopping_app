import {
  Controller,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { User } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/user/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('address')
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  async createAddress(
    @UserInfo() user: User,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    if (user.id !== createAddressDto.userId) {
      throw new NotFoundException('User not found');
    }
    return this.addressService.createAddress(user, createAddressDto);
  }

  @Put(':id')
  async updateAddress(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressService.updateAddress(id, updateAddressDto);
  }

  @Delete(':id')
  async deleteAddress(@Param('id') id: string) {
    return this.addressService.deleteAddress(id);
  }

  @Get()
  async getAddresses(@UserInfo() user: User) {
    return this.addressService.getAddressesByUser(user);
  }
}

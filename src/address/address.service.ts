import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { User } from 'src/user/entities/user.entity';
import { AddressEntity } from './entities/address.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
  ) {}

  async createAddress(
    user: User,
    createAddressDto: CreateAddressDto,
  ): Promise<AddressEntity> {
    return await this.addressRepository.save({
      ...createAddressDto,
      user,
    });
  }

  async updateAddress(
    id: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<AddressEntity> {
    try {
      const address = await this.getAddressById(id);
      if (address) {
        Object.assign(address, updateAddressDto);
        return this.addressRepository.save(address);
      } else {
        throw new NotFoundException('Address not found');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Something went wrong', 500);
    }
  }

  async getAddressById(id: string): Promise<AddressEntity> {
    try {
      return await this.addressRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      throw new NotFoundException('Address not found');
    }
  }

  async deleteAddress(id: string): Promise<{ message: string }> {
    const result = await this.addressRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Address not found');
    } else {
      return { message: 'Address deleted successfully' };
    }
  }

  async getAddressesByUser(user: User): Promise<AddressEntity[]> {
    return this.addressRepository.find({
      where: { user },
    });
  }
}

import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Profile } from './entities/profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async create(createUserDto: CreateUserDto, isSeller?: boolean) {
    try {
      const isExistingUser = await this.userRepo.findOne({
        where: { email: createUserDto.email },
      });

      if (isExistingUser) {
        throw new ConflictException('User already exists');
      }

      const user = new User();
      Object.assign(user, createUserDto);

      if (isSeller) {
        user.role = UserRole.SELLER;
      }

      const profile = new Profile();

      const savedProfile = await this.profileRepo.save(profile);

      user.profile = savedProfile;

      return await this.userRepo.save(user);
    } catch (error) {
      console.log({ error });
      throw new HttpException('Something went wrong', 400);
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepo.find();
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ authToken: string; id: string; email: string; name: string }> {
    try {
      const user = await this.userRepo.findOne({
        where: { email: loginUserDto.email },
        select: ['password', 'email', 'id', 'profile', 'name'],
        relations: {
          profile: false,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.validatePassword(loginUserDto.password)) {
        throw new NotFoundException('Invalid credentials');
      }

      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      const authToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      return { authToken, ...payload };
    } catch (error) {
      console.log({ error });
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          error.message,
          error.getStatus().toString(),
        );
      }
      throw new HttpException('Something went wrong', 400);
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      return await this.userRepo.findOne({ where: { id } });
    } catch (error) {
      console.log({ error });
      throw new HttpException('Something went wrong', 400);
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${updateUserDto} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

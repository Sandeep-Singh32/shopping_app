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
import { CartEntity } from 'src/cart/entities/cart.entity';
import { S3Service } from 'src/shared/s3.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private S3service: S3Service,
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
      const cart = new CartEntity();
      const savedProfile = await this.profileRepo.save(profile);
      const savedCart = await this.cartRepository.save(cart);

      user.profile = savedProfile;
      user.cart = savedCart;

      return await this.userRepo.save(user);
    } catch (error) {
      console.log({ error });
      if (error instanceof ConflictException) {
        throw error;
      }
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
          products: true,
          cart: true,
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

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    try {
      const user = await this.findOne(id);

      if (id) {
        if (file) {
          const key = `profile/${file.originalname}`;

          const result = await this.S3service.uploadFileToS3(file, key);
          user.profile.profileImage = result;
        }

        Object.assign(user, updateUserDto);
        return await this.userRepo.save(user);
      }
    } catch (error) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.findOne(id);

      if (id) {
        user.profile.isArchive = true;
        await this.userRepo.remove(user);
        return { message: 'deleted successfully' };
      }
    } catch (error) {
      throw new HttpException('Something went wrong', 500);
    }
  }
}

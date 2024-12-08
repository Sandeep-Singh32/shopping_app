import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository, EntityManager, Brackets } from 'typeorm';
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
    @InjectEntityManager() private entityManager: EntityManager,
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
      return await this.userRepo.findOne({
        where: { id },
        // relationLoadStrategy: 'join',
      });
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

        Object.assign(user.profile, updateUserDto);
        console.log('user --', user);
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

  async getUserProfileByEntityManager(user: User): Promise<any> {
    try {
      console.log('inside the entity manager service ');
      // const userEntityCount = this.entityManager
      //   .createQueryBuilder()
      //   .from('user', 'us')
      //   .select()
      //   .getCount();

      // const userEntity = this.entityManager
      //   .createQueryBuilder()
      //   .from(User, 'us')
      //   .select('us')
      //   .getManyAndCount();

      //returns column name as it is defined in the entity
      // .getManyAndCount(); will return array of two index, index 0 will return data and index 1 will return count of data fetched, for that something needs to added in select

      // const userEntity2 = this.entityManager
      //   .createQueryBuilder(User, 'user')
      //   .select()
      //   .getRawMany();

      //returns user as a prefix before column name is the entity only in case of getRawMany, but getMany will return actual column name
      //also we can use  .select(['u.name as Name, u.email as email']) to alias this raw many colun name

      // const userEntity2 = this.entityManager
      //   .createQueryBuilder(User, 'u')
      //   .select(['u.name', 'u.email'])
      //   .where('u.id =:id OR u.name =:name ', { id: user.id, name: "Piya Negi" })
      //   .getMany();

      // const userEntity2 = this.entityManager
      //   .createQueryBuilder(User, 'u')

      //   .leftJoin('u.profile', 'profile')
      //   .select(['u.name as Name', 'u.email as email', 'u.role as role', 'profile'])
      //   .where('(u.id =:id OR u.name =:name)', {
      //     id: user.id,
      //     name: 'Piya Negi',
      //   })
      //   .andWhere('u.role =:role', { role: UserRole.USER })
      //   .orderBy('u.name', 'ASC')
      //   .limit(5)
      //   .offset(0)
      //   .getRawMany();

      //only getRawMany works in above since alias is user otherwise we can use getMany
      //profile object will not be nested

      // const userEntity2 =  this.entityManager
      //   .createQueryBuilder(User, 'u')

      //   .leftJoin('u.profile', 'profile', 'profile.status =:mood', {mood: 'happy'})
      //   .select([
      //     'u',
      //     'profile',
      //   ])
      //   .where('(u.id =:id OR u.name =:name)', {
      //     id: user.id,
      //     name: 'Piya Negi',
      //   })
      //   .andWhere('u.role =:role', { role: UserRole.USER })
      //   .orderBy('u.name', 'ASC')
      //   .limit(5)
      //   .offset(0)
      //   .getMany();

      // const userEntity2 = this.userRepo
      //   .createQueryBuilder('u')
      //   .innerJoin('u.profile', 'profile', 'profile.status =:mood', {
      //     mood: 'happy',
      //   })
      //   .select(['u', 'profile'])
      //   // .where('(u.id =:id OR u.name =:name)', {
      //   //   id: user.id,
      //   //   name: 'Piya Negi',
      //   // })
      //   .andWhere('u.role =:role', { role: UserRole.USER });

      // userEntity2.andWhere(
      //   new Brackets((qb) => {
      //     qb.orWhere('u.id =:id ', { id: user.id }).orWhere('u.name LIKE :name', {
      //       name: '_iya%',
      //     });
      //   }),
      // );

      // userEntity2.orderBy('u.name', 'ASC').limit(5).offset(0);

      // const [response] = await Promise.all([userEntity2]);

      // return await userEntity2.getMany();

      // const userWithProfile = await this.entityManager
      //   .createQueryBuilder('user', 'u')
      //   .leftJoinAndMapOne(
      //     'u.profileData',
      //     'u.profile',
      //     'p',
      //     'p.id =:profileId',
      //     {
      //       profileId: '6f84d68d-1de6-4adc-b976-8e1f30550e9a',
      //     },
      //   )
      //   .select(['u', 'p'])
      //   .where('u.id = :id', { id: user.id })
      //   .getMany();

      // return userWithProfile;

      //map the data of profile entity to the user entity
      //profile data is the nested object name, u.profile is the relation with p as alias
      //p.id should be equal to u.profileId

      // const userWithProfile = await this.entityManager
      // .createQueryBuilder('user', 'u')
      // .leftJoinAndMapOne(
      //   'u.profileData',
      //   'u.profile',
      //   'p',
      //   'p.id =:profileId',
      //   {
      //     profileId: '6f84d68d-1de6-4adc-b976-8e1f30550e9a',
      //   },
      // )
      // .select(['u', 'p'])
      // // .where('u.id = :id', { id: user.id })
      // .getMany();

      //left join is gonna return all the return despite profileData being null but inner join wil not do it, it will return data if profileData is not empty or not null

      const userWithProfile = await this.entityManager
        .createQueryBuilder('user', 'u')
        .innerJoinAndMapOne(
          'u.profileData',
          'u.profile',
          'p',
          'p.id = u.profileId',
         
        )
        .select(['u', 'p'])
        // .where('u.id = :id', { id: user.id })
        .getMany();
      return userWithProfile;
    } catch (error) {
      throw new HttpException('Something went wrong', 500);
    }
  }
}

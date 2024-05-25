import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/user/entities/profile.entity';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
  ) {}
  async getUserById(userId: string): Promise<User> {
    try {
      return await this.userRepo.findOne({ where: { id: userId } });
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async findAdminUser(): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { role: UserRole.ADMIN } });
  }

  async createAdminUserIfNotExists() {
    const existingAdmin = await this.findAdminUser();
    if (!existingAdmin) {
      const adminUser = new User();
      adminUser.email = 'admin@user.com';
      adminUser.password = '123456';
      adminUser.name = 'admin';
      const profile = new Profile();
      const savedProfile = await this.profileRepo.save(profile);
      adminUser.profile = savedProfile;
      adminUser.role = UserRole.ADMIN;

      return this.userRepo.save(adminUser);
    }
  }
}

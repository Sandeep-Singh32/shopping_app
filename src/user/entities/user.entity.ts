import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Profile } from './profile.entity';
import { Product } from 'src/product/entities/product.entity';
import { AddressEntity } from 'src/address/entities/address.entity';
import { CartEntity } from 'src/cart/entities/cart.entity';

export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  USER = 'ROLE_USER',
  SELLER = 'ROLE_SELLER',
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Product, (product) => product.owner)
  @JoinColumn()
  products: Product[];

  @OneToMany(() => AddressEntity, (address) => address.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  address: AddressEntity[];

  @OneToOne(() => CartEntity, (cart) => cart.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  cart: CartEntity;

  validatePassword(password: string) {
    return bcrypt.compareSync(password, this.password);
  }
}

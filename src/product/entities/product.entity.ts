import { CartEntity } from 'src/cart/entities/cart.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum ProductCategory {
  MOBILE = 'mobile',
  ELECTRONIC = 'electronic',
  FURNITURE = 'furniture',
  CLOTHES = 'clothes',
  ACCESSORIES = 'accessories',
  TOYS = 'toys',
}

@Entity()
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  quantity: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  totalQuantity: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: ProductCategory,
    default: ProductCategory.MOBILE,
  })
  category: ProductCategory;

  @ManyToOne(() => User, (user) => user.products, { cascade: true })
  @JoinColumn()
  owner: User;

  @ManyToOne(() => CartEntity, (cart) => cart.products, { onDelete: 'CASCADE' })
  @JoinColumn()
  cart: CartEntity;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

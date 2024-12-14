import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';

@Entity({ name: 'cart' })
export class CartEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.cart)
  @JoinColumn()
  user: User;

  // @OneToMany(() => Product, (product) => product.cart, {
  //   cascade: true,
  //   eager: true,
  // })
  // products: Product[];

  @ManyToMany(() => Product, (product) => product.cart, { eager: true })
  @JoinTable({
    name: 'cart_products', // join table that holds many-to-many relationship
    joinColumns: [{ name: 'cartId', referencedColumnName: 'id' }], // cartId column
    inverseJoinColumns: [{ name: 'productId', referencedColumnName: 'id' }], // productId column
  })
  products: Product[];

  @Column({ type: 'decimal', default: 0.0 })
  totalPrice: number;
}

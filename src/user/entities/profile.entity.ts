import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum GenderType {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum UserStatus {
  HAPPY = 'happy',
  SAD = 'sad',
  OKAY = 'okay',
}

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  age: number;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.HAPPY })
  status: UserStatus;

  @Column({ type: 'enum', enum: GenderType, default: GenderType.MALE })
  gender: GenderType;

  @Column({ nullable: true })
  profileImage: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;

  @Column({ default: false })
  isArchive: boolean;
}

import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/user/entities/user.entity';

export const IS_PUBLIC_KEY = 'isPublic';
export const REQUIRED_ROLES = 'requiredRoles';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const ProductRequiredRoles = () =>
  SetMetadata(REQUIRED_ROLES, [UserRole.ADMIN, UserRole.SELLER]);

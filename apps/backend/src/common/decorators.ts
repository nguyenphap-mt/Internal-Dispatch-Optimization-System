import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Permission } from './permissions';

export const PERMISSIONS_KEY = 'required_permissions';
export const RequirePermissions = (...perms: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, perms);

export const PUBLIC_KEY = 'is_public';
export const Public = () => SetMetadata(PUBLIC_KEY, true);

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role_code: string;
  permissions: Permission[];
  department?: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthUser, PERMISSIONS_KEY } from '../decorators';
import { Permission } from '../permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const user: AuthUser = context.switchToHttp().getRequest().user;
    if (!user) throw new ForbiddenException('Không có thông tin người dùng');

    const granted = new Set(user.permissions ?? []);
    const ok = required.every((p) => granted.has(p));
    if (!ok) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }
    return true;
  }
}

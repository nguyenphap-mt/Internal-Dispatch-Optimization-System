import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../common/decorators';
import { Permission } from '../common/permissions';

export interface JwtPayload {
  sub: string;
  email: string;
  full_name: string;
  role_code: string;
  permissions: Permission[];
  department?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'dispatch-dev-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    return {
      id: payload.sub,
      email: payload.email,
      full_name: payload.full_name,
      role_code: payload.role_code,
      permissions: payload.permissions ?? [],
      department: payload.department,
    };
  }
}

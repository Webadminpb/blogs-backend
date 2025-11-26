import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Request } from 'express';
import { AuthTokenPayload } from './types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      // no role restrictions
      return true;
    }

    const req = context.switchToHttp().getRequest<
      Request & {
        user?: AuthTokenPayload & { roles?: string[] };
      }
    >();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRoles = Array.isArray(user.roles)
      ? user.roles
      : [user.role].filter(Boolean);
    const hasRole = userRoles.some((r) => requiredRoles.includes(r));

    if (!hasRole) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}

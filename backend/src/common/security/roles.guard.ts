import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export type Role = 'admin' | 'oracle' | 'reinsurer' | 'contributor';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const walletHeader: string | undefined = request.headers['x-wallet-id'] || request.headers['authorization'];
    const walletId = typeof walletHeader === 'string' ? (walletHeader.startsWith('Bearer ') ? walletHeader.substring(7) : walletHeader) : undefined;
    if (!walletId) return false;

    const envLists: Record<Role, string[]> = {
      admin: (process.env.ADMIN_WALLETS || '').split(',').map((x) => x.trim()).filter(Boolean),
      oracle: (process.env.ORACLE_WALLETS || '').split(',').map((x) => x.trim()).filter(Boolean),
      reinsurer: (process.env.REINSURER_WALLETS || '').split(',').map((x) => x.trim()).filter(Boolean),
      contributor: (process.env.CONTRIBUTOR_WALLETS || '').split(',').map((x) => x.trim()).filter(Boolean),
    };

    for (const role of requiredRoles) {
      const allowed = envLists[role] || [];
      if (allowed.includes(walletId)) return true;
    }
    return false;
  }
}



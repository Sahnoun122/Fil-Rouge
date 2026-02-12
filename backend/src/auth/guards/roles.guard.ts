import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';

// Decorator pour définir les rôles requis
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Si aucun rôle spécifié, autoriser l'accès
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false; // Pas d'utilisateur authentifié
    }

    return requiredRoles.some((role) => user.role === role);
  }
}

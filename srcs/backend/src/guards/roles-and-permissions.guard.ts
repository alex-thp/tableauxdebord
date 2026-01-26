import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesAndPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const url: string = request.url;

    // Autoriser toutes les routes /shared_link/*
    console.log('URL demandée:', url);
    if (url.startsWith('*/shared_link/*')) {
      return true;
    }
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!user) {
      console.error('Utilisateur non authentifié');
      throw new ForbiddenException('Utilisateur non authentifié');
    }
    const hasRole =
      !requiredRoles ||
      requiredRoles.some(
        (role) =>
          user.roles?.includes(role) || user.roles?.includes('superAdmin'),
      );
    const hasPermission =
      !requiredPermissions ||
      requiredPermissions.some((permission) =>
        user.permissions?.includes(permission),
      ) ||
      user.roles?.includes('superAdmin');

    if (!hasRole || !hasPermission) {
      console.error('Accès refusé : rôle ou permission manquant(e)');
      console.error('Rôles requis:', requiredRoles);
      throw new ForbiddenException(
        'Accès refusé : rôle ou permission manquant(e)',
      );
    }

    return true;
  }
}

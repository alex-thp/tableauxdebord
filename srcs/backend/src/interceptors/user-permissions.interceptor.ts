import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserService } from '../user/user.service';

@Injectable()
export class UserPermissionsInterceptor implements NestInterceptor {
  constructor(private readonly userService: UserService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const url: string = request.url;

    // Autoriser toutes les routes /shared_link/*
    console.log('URL demandée:', url);
    if (url.startsWith('*/shared_link/*')) {
      return next.handle();
    }

    if (user && user.id) {
        const fullUser = await this.userService.findUserWithRolesAndPermissions(user.id);
        if (!fullUser) {
            throw new Error('User not found');
        }
        request.user.roles = fullUser.roles.map(r => r.name); // ['admin', 'editor']
        request.user.permissions = fullUser.permissions; // ['user.read']
    }

    return next.handle();
  }
}

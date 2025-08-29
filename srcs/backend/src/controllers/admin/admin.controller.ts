import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { Roles } from '../../decorators/roles.decorator';
import { RolesAndPermissionsGuard } from '../../guards/roles-and-permissions.guard';
import { AuthGuard } from '@nestjs/passport';
import { UserPermissionsInterceptor } from '../../interceptors/user-permissions.interceptor';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesAndPermissionsGuard)
@UseInterceptors(UserPermissionsInterceptor)
export class AdminController {
  @Get('dashboard')
  @Roles('superAdmin')
  getAdminDashboard() {
    return {
      message: 'Bienvenue dans le dashboard admin',
      secureData: [1, 2, 3],
    };
  }
}
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { RolesAndPermissionsGuard } from '../guards/roles-and-permissions.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesAndPermissionsGuard)
export class AdminController {
  @Get('dashboard')
  @Roles('admin')
  getAdminDashboard() {
    return {
      message: 'Bienvenue dans le dashboard admin',
      secureData: [1, 2, 3],
    };
  }
}
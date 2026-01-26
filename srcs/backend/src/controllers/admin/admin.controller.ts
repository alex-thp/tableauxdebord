import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../../decorators/roles.decorator';
import { RolesAndPermissionsGuard } from '../../guards/roles-and-permissions.guard';
import { AuthGuard } from '@nestjs/passport';
import { UserPermissionsInterceptor } from '../../interceptors/user-permissions.interceptor';
import { AdminService } from '../../services/admin/admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesAndPermissionsGuard)
@UseInterceptors(UserPermissionsInterceptor)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @Roles('superAdmin')
  getAdminDashboard() {
    return {
      message: 'Bienvenue dans le dashboard admin',
      secureData: [1, 2, 3],
    };
  }

  @Roles('superAdmin')
  @Post('change-password')
  async adminChangePassword(
    @Req() req: any,
    @Body()
    body: {
      userId: number;
      newPassword: string;
    },
  ) {
    const adminId = req.user.sub;
    const roles = req.user.roles ?? [];

    // Vérifier que l'utilisateur connecté est admin
    if (!roles.includes('admin')) {
      throw new ForbiddenException('Only admins can change user passwords');
    }

    if (!body.userId || !body.newPassword) {
      throw new UnauthorizedException('userId and newPassword are required');
    }

    return this.adminService.adminChangePassword(body.userId, body.newPassword);
  }

  @Roles('superAdmin')
  @Delete('delete-user/:id')
  async deleteUser(@Req() req: any, @Param('id') userId: number) {
    const roles = req.user.roles ?? [];

    if (!roles.includes('admin')) {
      throw new ForbiddenException('Only admins can delete user accounts');
    }

    return this.adminService.deleteAccount(userId);
  }
}

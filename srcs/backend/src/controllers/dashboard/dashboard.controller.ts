import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './../../services/dashboard/dashboard.service';
import { Roles } from '../../decorators/roles.decorator';
import { RolesAndPermissionsGuard } from '../../guards/roles-and-permissions.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(AuthGuard('jwt'), RolesAndPermissionsGuard)
  @Roles('admin')
  @Get('data')
  async getDashboardData(@Query('today') today?: Date): Promise<any> {
    return this.dashboardService.getDashboardData(today);
  }
}

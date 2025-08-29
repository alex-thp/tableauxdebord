import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { UpdateBaseService } from './services/update-base/update-base.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private updateBase: UpdateBaseService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getData(): Promise<string> {
    console.log('getData called');
    return await this.appService.getMainData();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('updateDataBase')
  async updateDataBase(): Promise<string> {
    return await this.updateBase.retrieveBase();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('view')
  getView(
    @Query('mode') mode: number,
    @Query('date_debut') date_debut?: Date,
    @Query('date_fin') date_fin?: Date
  ) {
    // Gestion des valeurs par défaut
    const defaultDate = new Date();
    return this.appService.getView(
      mode,
      date_debut || defaultDate,
      date_fin || defaultDate
    );
  }
}

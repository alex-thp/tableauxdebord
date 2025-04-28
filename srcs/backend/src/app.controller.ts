import { Controller, Get, Param, ParseDatePipe, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { UpdateBaseService } from './update-base/update-base.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private updateBase: UpdateBaseService) {}

  @Get()
  async getData(): Promise<string> {
    return await this.appService.getMainData();
  }

  @Get('updateDataBase')
  async updateDataBase(): Promise<string> {
    return await this.updateBase.retrieveBase();
  }

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

  @Get('chart/:mode')
  getChart(@Param('mode') mode: string): string {
    return this.appService.getChart(mode);
  }

  @Get('sortie')
  getSorties(): string {
    return this.appService.getSorties();
  }
}

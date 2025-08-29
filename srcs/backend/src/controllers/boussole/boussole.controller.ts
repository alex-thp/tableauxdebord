import { Controller, Get, Post, Query } from '@nestjs/common';
import { BoussoleService } from '../../services/boussole/boussole.service';

@Controller('boussole')
export class BoussoleController {
    constructor(private readonly boussoleService: BoussoleService) {}

    @Get('data')
    async getBoussoleData(@Query('date_debut') date_debut: Date, @Query('date_fin') date_fin: Date): Promise<any> {
        let today = new Date();
        if (!date_debut) {
            date_debut = new Date(today.getFullYear(), 0, 1); // 1er janvier de l'année en cours
        }
        if (!date_fin) {
            date_fin = new Date(today.getFullYear(), 11, 31); // 31 décembre de l'année en cours
        }

        const data = await this.boussoleService.getBoussoleData(date_debut, date_fin);
        return data;
    }
}

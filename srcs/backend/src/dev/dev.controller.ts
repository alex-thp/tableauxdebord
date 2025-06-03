import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DevService } from './dev.service';

@Controller('dev')
export class DevController {
    constructor(private readonly devService: DevService) {}
    @UseGuards(AuthGuard('jwt'))
    @Get('test')
    async test(): Promise<any> {
        console.log('test called');
        return { message: 'It works!' };
    }

        /**
         * Endpoint to get the value of an indicator based on various parameters.
         * @param action - The action type.
         * @param action_localite - The local area for the action.
         * @param sujet - The subject of the indicator.
         * @param sujet_critere - The criteria for the subject.
         * @param sujet_localite - The local area for the subject.
         * @param sujet_indicateur - The specific indicator for the subject.
         * @param date_debut - The start date for filtering results.
         * @param date_fin - The end date for filtering results.
         * @returns A promise that resolves to a string representing the indicator value.
         */
      @UseGuards(AuthGuard('jwt'))
      @Get('indicateurValue')
      async getData(
        @Query('action') action: string,
        @Query('action_localite') action_localite: [string],
        @Query('sujet') sujet: string,
        @Query('sujet_critere') sujet_critere: string,
        @Query('sujet_localite') sujet_localite: [string],
        @Query('sujet_indicateur') sujet_indicateur: string,
        @Query('date_debut') date_debut: string,
        @Query('date_fin') date_fin: string
    ): Promise<any> {
        const debutDate = date_debut ? new Date(date_debut) : null;
        const finDate = date_fin ? new Date(date_fin) : null;
        let item ={
            action: action,
            action_localite: action_localite,
            sujet: sujet,
            sujet_critere: sujet_critere,
            sujet_localite: sujet_localite,
            sujet_indicateur: sujet_indicateur,
            date_debut: debutDate,
            date_fin: finDate
        };
        return await this.devService.calculate_function(item);
      }

}

import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DevService } from './../../services/dev/dev.service';
import { Roles } from '../../decorators/roles.decorator';
import { RolesAndPermissionsGuard } from '../../guards/roles-and-permissions.guard';

@UseGuards(AuthGuard('jwt'), RolesAndPermissionsGuard)
@Roles('admin')
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
   * Endpoint to get the value of an indicator based on a specific report.
   * @param rapport_x_indicateur - The report identifier.
   * @returns A promise that resolves to a string representing the indicator value.
   */
  @UseGuards() // Aucune authentification ou permission requise
  @Get('indicateur')
  async getRapportXIndicateur(
    @Query('rapport_x_indicateur') rapport_x_indicateur: string,
  ): Promise<any> {
    if (!rapport_x_indicateur) {
      throw new Error('rapport_x_indicateur is required');
    }
    const rapportxindicateur =
      await this.devService.getRapportXIndicateur(rapport_x_indicateur);
    if (!rapportxindicateur) {
      return { message: 'No data found for the given rapport_x_indicateur' };
    }
    const indicateur = await this.devService.getIndicateur(
      rapportxindicateur.indicateur_id,
    );
    if (!indicateur) {
      return {
        message: 'No indicator found for the given rapport_x_indicateur',
      };
    }
    const data = {
      action: indicateur.action,
      action_localite: indicateur.action_localite,
      sujet: indicateur.sujet,
      sujet_critere: indicateur.sujet_critere,
      sujet_localite: indicateur.sujet_localite,
      sujet_indicateur: indicateur.sujet_indicateur,
      date_debut: rapportxindicateur.date_debut,
      date_fin: rapportxindicateur.date_fin,
      structure_beneficiaire: rapportxindicateur.structure_beneficiaire,
      structure_financeur: rapportxindicateur.structure_financeur,
    };

    console.log('getIndicateur called with data:', data);

    return data;
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
  @Roles('admin')
  @Get('indicateurValue')
  async getData(
    @Query('action') action: string,
    @Query('action_localite') action_localite: [string],
    @Query('sujet') sujet: string,
    @Query('sujet_critere') sujet_critere: string,
    @Query('sujet_localite') sujet_localite: [string],
    @Query('sujet_indicateur') sujet_indicateur: string,
    @Query('date_debut') date_debut: string,
    @Query('date_fin') date_fin: string,
    @Query('structure_beneficiaire') structure_beneficiaire: [string],
  ): Promise<any> {
    const debutDate = date_debut ? new Date(date_debut) : null;
    const finDate = date_fin ? new Date(date_fin) : null;
    let item = {
      action: action,
      action_localite: action_localite,
      sujet: sujet,
      sujet_critere: sujet_critere ? [sujet_critere] : [],
      sujet_localite: sujet_localite,
      sujet_indicateur: sujet_indicateur,
      date_debut: debutDate,
      date_fin: finDate,
      structure_beneficiaire: structure_beneficiaire,
    };
    return await this.devService.calculate_function(item as any);
  }

  @UseGuards() // Aucune authentification ou permission requise
  @Roles()
  @Get('indicateurValue-public')
  async getFilteredDataPublic(
    @Query('action') action: string,
    @Query('action_localite') action_localite: string[],
    @Query('sujet') sujet: string,
    @Query('sujet_critere') sujet_critere: string | string[],
    @Query('sujet_localite') sujet_localite: string[],
    @Query('sujet_indicateur') sujet_indicateur: string,
    @Query('date_debut') date_debut: string,
    @Query('date_fin') date_fin: string,
    @Query('structure_beneficiaire') structure_beneficiaire: string[],
    @Query('fields') fields?: string[],
  ): Promise<any> {
    const debutDate = date_debut ? new Date(date_debut) : new Date(0);
    const finDate = date_fin ? new Date(date_fin) : new Date();

    const item = {
      action,
      action_localite,
      sujet,
      sujet_critere: sujet_critere
        ? Array.isArray(sujet_critere)
          ? sujet_critere
          : [sujet_critere]
        : [],
      sujet_localite,
      sujet_indicateur,
      date_debut: debutDate,
      date_fin: finDate,
      structure_beneficiaire,
    };

    const result = await this.devService.calculate_function(item);

    // Si aucun filtrage demandé, on retourne tout
    if (!fields?.length) {
      return result;
    }

    // On filtre dynamiquement les champs demandés
    const filtered = Object.fromEntries(
      Object.entries(result).filter(([key]) => fields.includes(key)),
    );

    console.log('Filtered result:', filtered);
    return filtered;
  }
}

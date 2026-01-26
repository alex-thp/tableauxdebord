import { Controller, Get, Query } from '@nestjs/common';
import { DevService } from '../../services/dev/dev.service';

@Controller('shared-view')
export class SharedViewController {
  constructor(private readonly devService: DevService) {}

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
  ): Promise<any> {
    // 💡 Valeurs par défaut si non spécifiées
    const fields = [
      'candidat_genre',
      'candidat_age',
      'candidat_code_postal',
      'qpv',
      'epa',
      'rqth',
      'orphelin',
      'sous_main_justice',
      'aide_sociale',
      'statut',
      'date_atelier',
      'atelier_lieu',
      'type_atelier',
      'note_satisfaction',
      'metier_recherche',
      'secteur_recherche',
      'droit_photo',
    ];
    const debutDate = date_debut ? new Date(date_debut) : new Date(0);
    const finDate = date_fin ? new Date(date_fin) : new Date();

    const item = {
      action,
      action_localite,
      sujet,
      sujet_critere: Array.isArray(sujet_critere)
        ? sujet_critere
        : sujet_critere
          ? [sujet_critere]
          : [],
      sujet_localite,
      sujet_indicateur,
      date_debut: debutDate,
      date_fin: finDate,
      structure_beneficiaire,
    };

    const result = await this.devService.calculate_function(item);

    const flatFields = fields.flat();
    let filtered;
    if (Array.isArray(result)) {
      filtered = result.map((obj) =>
        Object.fromEntries(
          Object.entries(obj).filter(([key]) => flatFields.includes(key)),
        ),
      );
    } else {
      filtered = result;
    }
    return filtered;
  }
}

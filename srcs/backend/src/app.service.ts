import { Injectable } from '@nestjs/common';
import { MongoDbService } from './mongo-db/mongo-db.service';
import { StatsAccompagnementService } from './stats-accompagnement/stats-accompagnement.service';
import { StatsBenevoleService } from './stats-benevole/stats-benevole.service';
import { StatsVetementService } from './stats-vetement/stats-vetement.service';

@Injectable()
export class AppService {
  constructor(private mongodb: MongoDbService,
    private statsAccompagnement: StatsAccompagnementService,
    private statsBenevole: StatsBenevoleService,
    private statsVetement: StatsVetementService) {}
  async getMainData(): Promise<any> {

    const currentYear = new Date().getFullYear();
    const date_debut = new Date(currentYear, 0, 1);// 01 janvier
    const date_fin = new Date(currentYear, 11, 31); // 31 décembre
    let data : {accompagnement: any, benevole: any, vetement: any} = {
      accompagnement: null,
      benevole: null,
      vetement: null
    };
    let accompagnement = await this.statsAccompagnement.getMainData(date_debut, date_fin);
    let benevole = await this.statsBenevole.getMainData(date_debut, date_fin);
    let vetement = await this.statsVetement.getMainData(date_debut, date_fin);
    data.accompagnement = accompagnement;
    data.benevole = benevole;
    data.vetement = vetement;
    return {data};
  }

  getView(mode, date_debut, date_fin): any {
    const currentYear = new Date().getFullYear();
    if (!date_debut) {
      date_debut = new Date(currentYear, 0, 1);// 01 janvier
    }
    if (!date_fin) {
      date_fin = new Date(currentYear, 11, 31); // 31 décembre
    }
    if (mode == '1') {
      return this.statsAccompagnement.getViewData(date_debut, date_fin);
    } else if (mode == '2') {
      return this.statsBenevole.getViewData(date_debut, date_fin);
    } else if (mode == '3') {
      return this.statsVetement.getViewData(date_debut, date_fin);
    }
  }

  getChart(mode): any {
    if (mode == 1) {
      return {
        nb_homme_cdp: 150,
        nb_femmes_cdp: 1500,
        nb_moins_30_cdp: 867,
        nb_plus_60_cdp: 534,
        nb_epa_cdp: 340,
        nb_ppsmj_cdp: 549,
      };
    } else if (mode == 2) {
      return {
        nb_homme_cdp: 1500,
        nb_femmes_cdp: 150,
        nb_moins_30_cdp: 867,
        nb_plus_60_cdp: 534,
        nb_epa_cdp: 340,
        nb_ppsmj_cdp: 549,
      };
    } else if (mode == 3) {
      return {
        nb_homme_cdp: 1420,
        nb_femmes_cdp: 1480,
        nb_moins_30_cdp: 867,
        nb_plus_60_cdp: 534,
        nb_epa_cdp: 340,
        nb_ppsmj_cdp: 549,
      };
    }
  }

  getSorties(): any {
    return {
      cdi: 324,
      cdd_moins: 852,
      cdd_plus: 867,
      stage: 534,
      en_recherche: 890,
      formation: 549,
    };
  }
}

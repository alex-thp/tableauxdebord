import { Injectable } from '@nestjs/common';
import { MongoDbService } from './services/mongo-db/mongo-db.service';
import { StatsAccompagnementService } from './services/stats-accompagnement/stats-accompagnement.service';
import { StatsBenevoleService } from './services/stats-benevole/stats-benevole.service';
import { StatsVetementService } from './services/stats-vetement/stats-vetement.service';

@Injectable()
export class AppService {
  constructor(
    private mongodb: MongoDbService,
    private statsAccompagnement: StatsAccompagnementService,
    private statsBenevole: StatsBenevoleService,
    private statsVetement: StatsVetementService,
  ) {}
  async getMainData(): Promise<any> {
    const currentYear = new Date().getFullYear();
    const date_debut = new Date(currentYear, 0, 1); // 01 janvier
    const date_fin = new Date(currentYear, 11, 31); // 31 décembre
    let data: { accompagnement: any; benevole: any; vetement: any } = {
      accompagnement: null,
      benevole: null,
      vetement: null,
    };
    let accompagnement = await this.statsAccompagnement.getMainData(
      date_debut,
      date_fin,
    );
    let benevole = await this.statsBenevole.getMainData(date_debut, date_fin);
    let vetement = await this.statsVetement.getMainData(date_debut, date_fin);
    data.accompagnement = accompagnement;
    data.benevole = benevole;
    data.vetement = vetement;
    return { data };
  }

  getView(mode, date_debut, date_fin): any {
    const currentYear = new Date().getFullYear();
    if (!date_debut) {
      date_debut = new Date(currentYear, 0, 1); // 01 janvier
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
}

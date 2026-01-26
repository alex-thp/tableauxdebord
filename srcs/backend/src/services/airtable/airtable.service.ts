import { Injectable } from '@nestjs/common';
const Airtable = require('airtable');
require('dotenv').config();

@Injectable()
export class AirtableService {
  base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE,
  );

  async getRecords(tableId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const records: any = [];
      this.base(tableId)
        .select({
          fields: ['JSON_FORMAT'], // Spécifie que seul ce champ doit être récupéré
        })
        .eachPage(
          (pageRecords: any[], fetchNextPage: any) => {
            records.push(...pageRecords);
            fetchNextPage();
          },
          (e) => {
            if (e) {
              reject(e);
            } else {
              resolve(records);
            }
          },
        );
    });
  }

  async getJsonFromTable(tableId, tableName) {
    let i = 0;
    let response;
    try {
      response = await this.getRecords(tableId);
      const result: any = [];
      while (typeof response[i] != 'undefined' && response[i] != null) {
        const tmp = response[i].fields.JSON_FORMAT;
        const parsedTmp: any = JSON.parse(tmp);
        result.push(parsedTmp);
        i++;
      }
      console.log(`getItem ${tableName} ended successfully !`);
      return result;
    } catch (e) {
      console.log(`ERROR on item ${tableName} => ${e}`);
      console.log(`On occurence ${i}`);
      if (response[i]) {
        console.log(response[i]);
      }
    }
  }

  async getDatabase() {
    try {
      console.log('dans la fonction get database');
      const tab = Promise.all([
        this.getJsonFromTable(process.env.TABLE_DOSSIER_FI, 'DOSSIER_FI'),
        this.getJsonFromTable(
          process.env.TABLE_SOUS_DOSSIER_FI,
          'SOUS_DOSSIER_FI',
        ),
        this.getJsonFromTable(process.env.TABLE_RAPPORT, 'RAPPORT'),
        this.getJsonFromTable(
          process.env.TABLE_RAPPORT_X_INDICATEUR,
          'RAPPORT_X_INDICATEUR',
        ),
        this.getJsonFromTable(process.env.TABLE_INDICATEUR, 'INDICATEUR'),
        this.getJsonFromTable(
          process.env.TABLE_SOUS_DOSSIER_FI_X_STRUCTURE_BENEFICIAIRE,
          'SOUS_DOSSIER_FI_X_STRUCTURE_BENEFICIAIRE',
        ),
        this.getJsonFromTable(process.env.TABLE_CDP_ENR_CAND, 'CDP_ENR_CAND'),
        this.getJsonFromTable(
          process.env.TABLE_AT_CO_ENR_CAND,
          'AT_CO_ENR_CAND',
        ),
        this.getJsonFromTable(process.env.TABLE_BIEN_ETRE, 'BIEN_ETRE'),
        this.getJsonFromTable(
          process.env.TABLE_BIEN_ETRE_ENR_CAND,
          'BIEN_ETRE_ENR_CAND',
        ),
        this.getJsonFromTable(process.env.TABLE_CDP_ENR_BENEV, 'CDP_ENR_BENEV'),
        this.getJsonFromTable(process.env.TABLE_BENEVOLE, 'BENEVOLE'),
        this.getJsonFromTable(process.env.TABLE_ZONE_GEO, 'ZONE_GEO'),
        this.getJsonFromTable(process.env.TABLE_CDP, 'CDP'),
        this.getJsonFromTable(process.env.TABLE_AT_CO, 'AT_CO'),
        this.getJsonFromTable(process.env.TABLE_CANDIDAT, 'CANDIDAT'),
        this.getJsonFromTable(
          process.env.TABLE_CONTACT_DE_STRUCTURE,
          'CONTACT_DE_STRUCTURE',
        ),
        this.getJsonFromTable(
          process.env.TABLE_CDP_SUIVI_CANDIDAT,
          'CDP_SUIVI_CANDIDAT',
        ),
        this.getJsonFromTable(
          process.env.TABLE_CDP_ENR_CAND_X_CDP_ENR_BENEV,
          'CDP_ENR_CAND_X_CDP_ENR_BENEV',
        ),
        this.getJsonFromTable(process.env.TABLE_STRUCTURE, 'STRUCTURE'),
        this.getJsonFromTable(process.env.TABLE_EVENEMENT_PC, 'EVENEMENT_PC'),
        this.getJsonFromTable(
          process.env.TABLE_EVENEMENT_BENEV,
          'EVENEMENT_BENEV',
        ),
        this.getJsonFromTable(
          process.env.TABLE_EVENEMENT_BENEV_X_BENEV,
          'EVENEMENT_BENEV_X_BENEV',
        ),
      ]);
      console.log('fin de la fonction getDatabase');
      return tab;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

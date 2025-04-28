import { Injectable } from '@nestjs/common';
const Airtable = require("airtable");
require("dotenv").config();

@Injectable()
export class AirtableService {
    base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE);

    async getRecords(tableId: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const records: any = [];
            this.base(tableId)
              .select({
                fields: ["JSON_FORMAT"], // Spécifie que seul ce champ doit être récupéré
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
                }
            );
        });
    }

    async getJsonFromTable(tableId, tableName) {
        let i = 0;
        let response;
        try {
            response = await this.getRecords(tableId);
            const result: any = [];
            while (typeof response[i] != "undefined" && response[i] != null) {
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
          console.log("dans la fonction get database");
          const tab = Promise.all([
            this.getJsonFromTable("tblF71jUBTiqi86yX", "DOSSIER_FI"),
            this.getJsonFromTable("tblG5nwUCZvX3xlaJ", "SOUS_DOSSIER_FI"),
            this.getJsonFromTable("tbl6F9yz1ZqqeVCy7", "RAPPORT"),
            this.getJsonFromTable("tblbrkYpmWPOniw0a", "RAPPORT_X_INDICATEUR"),
            this.getJsonFromTable("tblDACJgCWrJXoKUR", "INDICATEUR"),
            this.getJsonFromTable("tblojh7WOKmknh0na", "SOUS_DOSSIER_FI_X_STRUCTURE_BENEFICIAIRE"),
            this.getJsonFromTable("tblziWKNuRLpFbU4K", "CDP_ENR_CAND"),
            this.getJsonFromTable("tblkRdphlXIzQTIaB", "AT_CO_ENR_CAND"),
            this.getJsonFromTable("tblbrIMOh8Oef233P", "BIEN_ETRE"),
            this.getJsonFromTable("tblCMu1JAXjt9u0TX", "BIEN_ETRE_ENR_CAND"),
            this.getJsonFromTable("tblsnYD2AyCs0H147", "CDP_ENR_BENEV"),
            this.getJsonFromTable("tblr2sVTExBZ0EAWn", "BENEVOLE"),
            this.getJsonFromTable("tblibnceiDdVJscfR", "ZONE_GEO"),
            this.getJsonFromTable("tblvhUKxKCBAAK1cx", "CDP"),
            this.getJsonFromTable("tbl0o1T29fG9kyLhr", "AT_CO"),
            this.getJsonFromTable("tbl38gQpjIjxtkx3f", "CANDIDAT"),
            this.getJsonFromTable("tblZQMyB9QX5gJQJQ", "CONTACT_DE_STRUCTURE"),
            this.getJsonFromTable("tblfuHL8YvaVoY1wP", "CDP_SUIVI_CANDIDAT"),
            this.getJsonFromTable("tblXoJZo1CqXn7l2e", "CDP_ENR_CAND_X_CDP_ENR_BENEV"),
            this.getJsonFromTable("tblajbNcaHxraaf1d", "STRUCTURE"),
            this.getJsonFromTable("tblaDk5NdDSRpGPe1", "EVENEMENT_PC"),
            this.getJsonFromTable("tblxjmhSeGxoWFyk3", "EVENEMENT_BENEV"),
            this.getJsonFromTable("tbl9fBPibBCxDwUfg", "EVENEMENT_BENEV_X_BENEV"),
          ]);
          console.log("fin de la fonction getDatabase");
          return tab;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
}

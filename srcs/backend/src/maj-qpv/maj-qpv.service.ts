import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';
import Airtable from 'airtable';

@Injectable()
export class MajQpvService {

uri = process.env.MONGODB_URL;
client = new MongoClient(this.uri as string);

async update_airtable_10_by_10(toUpdate, table) {
  try {
    if (toUpdate.length > 0) {
      console.log(toUpdate.length);
      const base = new Airtable({
        apiKey: process.env.AIRTABLE_API_KEY,
      }).base(process.env.AIRTABLE_BASE as string);

      await base(table).update(toUpdate);
      console.log("updated.");
    }
  } catch (e) {
    console.log(`error in update_airtable_10_by_10 : ${e.message}`);
    console.log("pour le tableau : ");
    console.log(toUpdate);
  }
}

async fetch_data(cdpenrcand) {
  let data;
  const email = process.env.SIG_EMAIL;
  const password = process.env.SIG_PASSWD;

  // Création de la chaîne encodée en base64 : "email:motdepasse"
  const credentials = Buffer.from(`${email}:${password}`).toString("base64");

  // Préparation des headers avec l'authentification basique
  const headers = {
    "Authorization": `Basic ${credentials}`,
    "Content-Type": "application/json",
  };

  const baseUrl = "https://wsa.sig.ville.gouv.fr";
  const relativeUrl = `/api/v1?type_quartier[]=QP&type_adresse=MIXTE&adresse[code_postal]=${cdpenrcand.candidat_code_postal}&adresse[nom_commune]=${cdpenrcand.candidat_commune_ville}&adresse[nom_voie]=${cdpenrcand.candidat_numero_et_rue}`;

  // Création d'une URL absolue en combinant la base et le chemin relatif
  const new_url = baseUrl + relativeUrl;
  try {
    const response = await fetch(new_url, { method: "GET", headers });
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status} sur ${new_url}`);
    }
    data = await response.json();
    //console.log(`Réponse de ${new_url}:`, data);
  } catch (error) {
    console.error(`Erreur lors de l'appel à ${new_url} :`, error.message);
  }
  let type_qpv = "PAS TROUVE";
  let nom_quartier = "";
  let code_quartier = "";
  if (Array.isArray(data.reponses)) {
    if (data.reponses.length >= 1) {
      type_qpv = "NON";
      let i = data.reponses.length - 1;
      while (i >= 0) {
        if (data.reponses[i].code_reponse == "OUI") {
          type_qpv = data.reponses[i].type_quartier;
          nom_quartier = data.reponses[i].nom_quartier;
          code_quartier = data.reponses[i].code_quartier;
        }
        i--;
      }
    }
  }
  console.log(`code_postal = ${cdpenrcand.candidat_code_postal} nom_commune = ${cdpenrcand.candidat_commune_ville} nom_voie = ${cdpenrcand.candidat_numero_et_rue}`);
  console.log(type_qpv);
  return { id: cdpenrcand.record_id, fields: { QPV_AUTOMATISATION: type_qpv, QPV_NOM_QUARTIER_AUTOMATISATION: nom_quartier, QPV_CODE_QUARTIER_AUTOMATISATION: code_quartier } };
}

async majQPVFunction() {
  let result;
  try {
    let tabToUpdate: Array<{ id: string; fields: { QPV_AUTOMATISATION: string; QPV_NOM_QUARTIER_AUTOMATISATION: string; QPV_CODE_QUARTIER_AUTOMATISATION: string } }> = [];
    let i = 0;
    const db = this.client.db("test");
    const cdp_enr_cand = db.collection("cdpenrcands");
    const bien_etre_enr_cand = db.collection("bienetreenrcands");
    const at_co_enr_cand = db.collection("atcoenrcands");
    const cdp_enr_cand_array = await cdp_enr_cand
      .find({ statut: { $eq: "Présent" }, qpv_automatisation: { $eq: "" }, $or: [{ qpv_automatisation: { $exists: true, $eq: "" } }] })
      .toArray();
    const bien_etre_enr_cand_array = await bien_etre_enr_cand
      .find({ statut: { $eq: "Présent" }, qpv_automatisation: { $eq: "" }, $or: [{ qpv_automatisation: { $exists: true, $eq: "" } }] })
      .toArray();
    const at_co_enr_cand_array = await at_co_enr_cand
      .find({ statut: { $eq: "Présent" }, qpv_automatisation: { $eq: "" }, $or: [{ qpv_automatisation: { $exists: true, $eq: "" } }] })
      .toArray();

    for (let cdpenrcand of cdp_enr_cand_array) {
      if (i >= 9) {
        await this.update_airtable_10_by_10(tabToUpdate, process.env.AIRTABLE_CDP_ENR_CAND_TABLE);
        tabToUpdate = [];
        i = 0;
      }
      result = await this.fetch_data(cdpenrcand);
      tabToUpdate.push(result);
      i++;
    }
    if (i > 0) await this.update_airtable_10_by_10(tabToUpdate, process.env.AIRTABLE_CDP_ENR_CAND_TABLE);
    i = 0;
    result = [];
    for (let bienetreenrcand of bien_etre_enr_cand_array) {
      if (i >= 9) {
        await this.update_airtable_10_by_10(tabToUpdate, process.env.AIRTABLE_BIEN_ETRE_ENR_CAND_TABLE);
        tabToUpdate = [];
        i = 0;
      }
      result = await this.fetch_data(bienetreenrcand);
      tabToUpdate.push(result);
      i++;
    }
    if (i > 0) await this.update_airtable_10_by_10(tabToUpdate, process.env.AIRTABLE_BIEN_ETRE_ENR_CAND_TABLE);
    i = 0;
    result = [];
    for (let atcoenrcand of at_co_enr_cand_array) {
      if (i >= 9) {
        await this.update_airtable_10_by_10(tabToUpdate, process.env.AIRTABLE_AT_CO_ENR_CAND_TABLE);
        tabToUpdate = [];
        i = 0;
      }
      result = await this.fetch_data(atcoenrcand);
      tabToUpdate.push(result);
      i++;
    }
    if (i > 0) await this.update_airtable_10_by_10(tabToUpdate, process.env.AIRTABLE_AT_CO_ENR_CAND_TABLE);
    i = 0;
  } catch (e) {
    console.log("error in majQPVFunction : ");
    console.log(e);
  }
  return result;
}
}

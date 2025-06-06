import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Injectable()
export class DevService {
    uri :any = process.env.MONGODB_URL;
    private client: MongoClient;

    constructor() {this.client = new MongoClient(this.uri);}

    async getIndicateurValue(): Promise<any> {
        // Logique pour récupérer la valeur de l'indicateur
        return { message: 'Indicateur Value' };
    }

    async getRapportXIndicateur(rapport_x_indicateur) {
        if (!rapport_x_indicateur) {
            throw new Error('rapport_x_indicateur is required');
        }
        const db = this.client.db("test");
        const rapportxindicateur = db.collection("rapportxindicateurs");
        return await rapportxindicateur.findOne({ record_id: rapport_x_indicateur });
    }

    async getIndicateur(indicateur) {
        if (!indicateur) {
            throw new Error('indicateur is required');
        }
        const db = this.client.db("test");
        const rapportxindicateur = db.collection("indicateurs");
        return await rapportxindicateur.findOne({ record_id: indicateur });
    }

    updateQuery(currentQuery, field, value, comparisonToken, value2?) {
        switch (comparisonToken) {
            case "$eq":
                currentQuery[field] = { $eq: value };
                return currentQuery;
            case "$all":
                currentQuery[field] = { $all: [value] };
                return currentQuery;
            case "$in":
                currentQuery[field] = { $in: [value, value2] };
                return currentQuery;
            case "$gte":
                currentQuery[field] = { $gte: value };
                return currentQuery;
            case "$lt":
                currentQuery[field] = { $lt: value };
                return currentQuery;
            case "$lte":
                currentQuery[field] = { $lte: value };
                return currentQuery;
            case "$gte-$lt":
                currentQuery[field] = { $gte: value, $lt: value2 };
                return currentQuery;
            case "$in-tab":
                currentQuery[field] = { $in: value };
        }
        return currentQuery;
    }

    add_localite_to_query(currentQuery, field, values) {
        if (!currentQuery) currentQuery = {};
        if (!Array.isArray(values)) values = [values];

        // Crée un tableau de conditions regex
        const regexConditions = values.map((value) => {
        let tmp = value.split(" : ");
        if (tmp[0] === "code postal") {
            return { ["code_postal"]: { $regex: tmp[1], $options: "i" } };
        } else {
            return { [field]: { $regex: value, $options: "i" } };
        }
        });

        // Vérifie si $and existe déjà
        if (!currentQuery.$and) {
            currentQuery.$and = [];
        }

        // Ajoute un nouveau bloc $or distinct pour chaque champ
        currentQuery.$and.push({ $or: regexConditions });

        return currentQuery;
    }


    forge_request_sujet_critere(sujet_critere) {
        let currentQuery = {};
        if (sujet_critere) {
            for (const s_critere of sujet_critere) {
                if (s_critere === "< 30 ans" || s_critere === " < 30 ans") {
                    currentQuery = this.updateQuery(currentQuery, "candidat_age", 12, "$gte-$lt", 31);
                } else if (s_critere === "< 26 ans" || s_critere === " < 26 ans") {
                    currentQuery = this.updateQuery(currentQuery, "candidat_age", 12, "$gte-$lt", 27);
                } else if (s_critere === "< 20 ans" || s_critere === " < 20 ans") {
                    currentQuery = this.updateQuery(currentQuery, "candidat_age", 12, "$gte-$lt", 21);
                } else if (s_critere === "21-25 ans" || s_critere === " 21-25 ans") {
                    currentQuery = this.updateQuery(currentQuery, "candidat_age", 21, "$gte-$lt", 26);
                } else if (s_critere === "26-49 ans" || s_critere === " 26-49 ans") {
                    currentQuery = this.updateQuery(currentQuery, "candidat_age", 26, "$gte-$lt", 50);
                } else if (s_critere === "> 49 ans" || s_critere === " > 49 ans") {
                    currentQuery = this.updateQuery(currentQuery, "candidat_age", 49, "$gte-$lt", 120);
                } else if (s_critere === "Hommes" || s_critere === " Hommes") {
                    currentQuery = this.updateQuery(currentQuery, "candidat_genre", "Homme", "$eq");
                } else if (s_critere === "Femmes" || s_critere === " Femmes") {
                    currentQuery = this.updateQuery(currentQuery, "candidat_genre", "Femme", "$eq");
                } else if (s_critere === "Femme - 16-20 ans" || s_critere === " Femme - 16-20 ans") {
                    currentQuery = this.updateQuery(currentQuery, "candidat_genre", "Femme", "$eq");
                    currentQuery = this.updateQuery(currentQuery, "candidat_age", 16, "$gte-$lt", 21);
                } else if (s_critere === "QPV" || s_critere === " QPV") {
                    currentQuery = this.updateQuery(currentQuery, "qpv", "Oui", "$eq");
                } else if (s_critere === "EPA" || s_critere === " EPA") {
                    currentQuery = this.updateQuery(currentQuery, "epa", "EPA", "$eq");
                } else if (s_critere === "RSA" || s_critere === " RSA") {
                    currentQuery = this.updateQuery(currentQuery, "aide_sociale", "Revenu de Solidarité Actif (RSA)", "$eq");
                } else if (s_critere === "PPSMJ" || s_critere === " PPSMJ") {
                    currentQuery = this.updateQuery(currentQuery, "sous_main_justice", "Oui", "$eq");
                } else if (s_critere === "RQTH" || s_critere === " RQTH") {
                    currentQuery = this.updateQuery(currentQuery, "rqth", "Oui", "$eq");
                } else if (s_critere === "Orphelin" || s_critere === " Orphelin") {
                    currentQuery = this.updateQuery(currentQuery, "orphelin", "Oui", "$eq");
                } else if (s_critere !== "") {
                    let tmp = s_critere.split(" : ");
                    if (tmp[0] === "metier" || tmp[0] === " metier") {
                        currentQuery = this.updateQuery(currentQuery, "metier_recherche", tmp[1], "$eq");
                    } else if (tmp[0] === "secteur" || tmp[0] === " secteur") {
                        currentQuery = this.updateQuery(currentQuery, "secteur_recherche", tmp[1], "$eq");
                    } else if (tmp[0] === "ressources mensuelle" || tmp[0] === " ressources mensuelle") {
                        currentQuery = this.updateQuery(currentQuery, "ressources_mensuelle", Number(tmp[1]), "$lt");
                    }
                }
            }
        }
        return currentQuery;
    }

    async calculate_function(item) {
        console.log("starting calculate_function");
        let tabToUpdate = [];
        let i = 0;
        const db = this.client.db("test");
        const cdp = db.collection("cdps");
        const cdpenrbenev = db.collection("cdpenrbenevs");
        const cdpenrcand = db.collection("cdpenrcands");
        const cdpsuivi = db.collection("cdpsuivis");
        const bienetreenrcand = db.collection("bienetreenrcands");
        const atcoenrcand = db.collection("atcoenrcands");
        const contactdestructure = db.collection("contactdestructures");
        const candidat = db.collection("candidats");
        const entreprisexcollecte = db.collection("entreprisexcollectes");
        const collecte = db.collection("collectes");
        const entreprisextri = db.collection("entreprisextris");
        const tri = db.collection("tris");
        const benev = db.collection("benevs");
        const structures = db.collection("structures");
        const referents = db.collection("contactdestructures");
        const atCo = db.collection("atcos");
        const bienEtre = db.collection("bienetres");
        const matching = db.collection("cdpenrcandxcdpenrbenevs");
        const evenement_pc = db.collection("evenementpcs");

        const database = {
            cdp,
            cdpenrbenev,
            cdpenrcand,
            cdpsuivi,
            bienetreenrcand,
            atcoenrcand,
            contactdestructure,
            candidat,
            entreprisexcollecte,
            collecte,
            entreprisextri,
            tri,
            benev,
            structures,
            referents,
            atCo,
            bienEtre,
            matching,
            evenement_pc,
        };
        let data = "";
        if (item.action == "Accompagnement - CDP Fixe")
            data = await this.forge_request_nb_prescriptions_present_cdp(item, "CDP FIXE", database);
        else if (item.action == "Accompagnement - CDP Mobile")
            data = await this.forge_request_nb_prescriptions_present_cdp(item, "CDP MOBILE", database);
        else if (item.action == "Accompagnement - CDP Fixe ou Mobile")
            data = await this.forge_request_nb_prescriptions_present_cdp(item, "CDP FIXE, CDP MOBILE", database);
        return data;
    }

    async forge_request_nb_prescriptions_present_cdp(item, type_cdp, database) {
        item.sujet_critere = this.normalizeToArray(item.sujet_critere);
        console.log("ici : " + item.sujet_critere);
        let customQuery = this.forge_request_sujet_critere(item.sujet_critere);
        console.log(type_cdp)
        console.log(typeof type_cdp)
        switch (type_cdp) {
            case "CDP FIXE, CDP MOBILE":
            customQuery = this.updateQuery(customQuery, "type_atelier", "CDP MOBILE", "$in", "CDP FIXE");
            break;
            case "CDP FIXE":
            customQuery = this.updateQuery(customQuery, "type_atelier", "CDP FIXE", "$eq");
            break;
            case "CDP MOBILE":
            customQuery = this.updateQuery(customQuery, "type_atelier", "CDP MOBILE", "$eq");
            break;
        }
        customQuery = this.updateQuery(customQuery, "date_atelier", item.date_debut, "$gte-$lt", item.date_fin);
        customQuery = this.updateQuery(customQuery, "statut", "Présent", "$eq");
        const sujetLocalite: string[] = this.normalizeToArray(item.sujet_localite);
        const actionLocalite: string[] = this.normalizeToArray(item.action_localite);

        let action_loc_check = 0;
        let sujet_loc_check = 0;
        for (let localite of sujetLocalite) {
            if (localite != "n'importe quel département de la région" && localite != "N'importe quel département de la région" && localite != "France" && localite != "") {
            sujet_loc_check = 1;
            }
        }
        for (let localite of actionLocalite) {
            if (localite != "n'importe quel département de la région" && localite != "N'importe quel département de la région" && localite != "France" && localite != "") {
            action_loc_check = 1;
            }
        }
        if (sujet_loc_check == 1) {
            console.log("sujetLocalite", sujetLocalite);
            customQuery = this.add_localite_to_query(customQuery, "candidat_residence", sujetLocalite);
        }

        if (action_loc_check == 1) {
            console.log("actionLocalite", actionLocalite);
            customQuery = this.add_localite_to_query(customQuery, "atelier_lieu", actionLocalite);
        }
        console.log("customQuery", customQuery);
        let response = await database.cdpenrcand
        .aggregate([
        // Partie 1 : Filtrage des données selon customQuery
        {
            $match: customQuery,
        },
        // Partie 2 : Association des suivis
        {
            $lookup: {
            from: "cdpsuivis",
            localField: "candidat_record_id",
            foreignField: "candidat_record_id",
            as: "suiviDetails",
            },
        },
    {
        $addFields: {
          sortiesPositives: {
            $size: {
              $filter: {
                input: "$suiviDetails",
                as: "suivi",
                cond: {
                  $in: [
                    "$$suivi.situation_pro",
                    [
                      "CDI",
                      "CDD (- de 6 mois)",
                      "CDD (6 mois ou +)",
                      "En formation",
                      "En stage",
                      "Auto-entrepreneur / Entrepreneur/ Création entreprise",
                      "En alternance / En contrat d'apprentissage",
                      "Intérim",
                    ],
                  ],
                },
              },
            },
          },
          nombreSuivis: { $size: "$suiviDetails" },
        },
      },     
    ])
    .toArray();
    return response;
    }

    normalizeToArray(input: any): string[] {
        if (Array.isArray(input)) return input;
        if (typeof input === 'string') {
        try {
            const parsed = JSON.parse(input);
            if (Array.isArray(parsed)) return parsed;
            return [input];
        } catch {
            return [input];
        }
        }
        return [];
    }
}




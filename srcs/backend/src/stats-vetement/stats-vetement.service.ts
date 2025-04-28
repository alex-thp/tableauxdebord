import { Injectable } from '@nestjs/common';
import { MongoDbService } from 'src/mongo-db/mongo-db.service';

@Injectable()
export class StatsVetementService {
    constructor(private mongodb: MongoDbService) {}
    
    async get_tmp_nb_collecte(evenement_pc, date_debut, date_fin) {
      let tmp_nb_collecte = await evenement_pc.aggregate([
        {
            $match: {
                date: { $gte: date_debut, $lt: date_fin },
                type: "COLLECTE"
            }
        },
        {
            $count: "count"
        }
    ]).toArray();
    return tmp_nb_collecte;
    }

    async get_tmp_nb_fresque(evenement_pc, date_debut, date_fin) {
      let tmp_nb_fresque = await evenement_pc.aggregate([
        {   $match: {
            date: { $gte: date_debut, $lt: date_fin },
            type: "FRESQUE"
        }
        },
        {
            $count: "count"
        }
      ]).toArray();
      return tmp_nb_fresque;
    }

    async get_tmp_nb_tri(evenement_pc, date_debut, date_fin) {
      let tmp_nb_tri = await evenement_pc.aggregate([
        {
            $match: {
                date: { $gte: date_debut, $lt: date_fin },
                type: "TRI"
            }
        },
        {
            $count: "count"
        }
    ]).toArray();
    return tmp_nb_tri;
    }

    async get_nb_benevoles_unique(cdpenrbenev, date_debut, date_fin) {
      const nbBenevolesUniques = await cdpenrbenev.aggregate([
        {
          $match: {
            benevole_id: { $ne: null },
            date_atelier: { $gte: date_debut, $lt: date_fin },
            est_be: { $eq: "Oui" }, //Est BE
            statut: { $in: ["Présent", "Positionné"] }
          }
        },
        {
          $group: {
            _id: "$benevole_id"
          }
        },
        {
          $count: "benevolesUniques"
        }
      ]).toArray();
      return nbBenevolesUniques;
    }

    async get_nb_benevole_unique_ancien(cdpenrbenev, startOfWeek, endOfWeek) {
      const nbBenevolesUniquesAncien_semaine = await cdpenrbenev.aggregate([
        {
          $match: {
            benevole_id: { $ne: null },
            date_atelier: { $ne: null },
            statut: { $in: ["Présent", "Positionné"] },
            est_be: { $eq: "Oui" } //Est BE
          }
        },
        {
          $group: {
            _id: "$benevole_id",
            minDate: { $min: "$date_atelier" }
          }
        },
        {
          $match: {
            minDate: {
              $gte: startOfWeek,
              $lt: endOfWeek,
            }
          }
        },
        {
          $count: "benevolesUniques"
        }
      ]).toArray();
      return nbBenevolesUniquesAncien_semaine;
    }

    async get_nb_benevole_unique_semaine(cdpenrbenev, startOfWeek, endOfWeek) {
      const nbBenevolesUniques_semaine = await cdpenrbenev.aggregate([
        {
          $match: {
            benevole_id: { $ne: null },
            date_atelier: { $gte: startOfWeek, $lt: endOfWeek },
            est_be: { $eq: "Oui" }, //Est BE
            statut: { $in: ["Présent", "Positionné"] }
          }
        },
        {
          $group: {
            _id: "$benevole_id"
          }
        },
        {
          $count: "benevolesUniques"
        }
      ]).toArray();
      return nbBenevolesUniques_semaine;
    }

    async getMainData(date_debut, date_fin) {
        const connection = this.mongodb.client.db('test');
        const cdp = connection.collection("cdps");
        const cdpenrbenev = connection.collection("cdpenrbenevs");
        const cdpenrcand = connection.collection("cdpenrcands");
        const cdpsuivi = connection.collection("cdpsuivis");
        const bienetreenrcand = connection.collection("bienetreenrcands");
        const atcoenrcand = connection.collection("atcoenrcands");
        const contactdestructure = connection.collection("contactdestructures");
        const candidat = connection.collection("candidats");
        const benev = connection.collection("benevs");
        const structures = connection.collection("structures");
        const referents = connection.collection("contactdestructures");
        const atCo = connection.collection("atcos");
        const bienEtre = connection.collection("bienetres");
        const matching = connection.collection("cdpenrcandxcdpenrbenevs");
        const evenement_pc = connection.collection("evenementpcs");

        let today = new Date();
        let startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        let endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));    

        let result = {label: "Pôle Vêtement",
            left: {
                label: '2025', 
                nb_collecte: 0, 
                nb_tri: 0, 
                nb_fresque: 0,
                nb_collab: 0,
            },
            right: {
                label: 'Cette semaine', 
                nb_atelier_collab: 0, 
                nb_collab: 0, 
                nb_premier_atelier: 0
            }};

        let tmp_nb_collecte = await this.get_tmp_nb_collecte(evenement_pc, date_debut, date_fin);

        let tmp_nb_fresque = await this.get_tmp_nb_fresque(evenement_pc, date_debut, date_fin);

        let tmp_nb_tri = await this.get_tmp_nb_tri(evenement_pc, date_debut, date_fin);

        const nbBenevolesUniques = await this.get_nb_benevoles_unique(cdpenrbenev, date_debut, date_fin);

        const nbBenevolesUniquesAncien_semaine = await this.get_nb_benevole_unique_ancien(cdpenrbenev, startOfWeek, endOfWeek);

        const nbBenevolesUniques_semaine = await this.get_nb_benevole_unique_semaine(cdpenrbenev, startOfWeek, endOfWeek);

        result.left.nb_collecte = tmp_nb_collecte[0]?.count || 0;
        result.left.nb_tri = tmp_nb_tri[0]?.count || 0;
        result.left.nb_collab = nbBenevolesUniques[0]?.benevolesUniques || 0;
        result.left.nb_fresque = tmp_nb_fresque[0]?.count || 0;

        result.right.nb_premier_atelier = nbBenevolesUniquesAncien_semaine[0]?.benevolesUniques || 0;
        result.right.nb_collab = nbBenevolesUniques_semaine[0]?.benevolesUniques || 0;
        result.right.nb_atelier_collab = nbBenevolesUniques_semaine[0]?.benevolesUniques || 0;
        return result;
    }

    async get_nb_repartition(cdp_enr_benev, date_debut, date_fin) {
      const raw = await cdp_enr_benev.aggregate([
        {
          $lookup: {
            from: 'cdps', // ATTENTION : nom de la collection MongoDB ("cdps", pas "Cdp")
            localField: 'cdp_record_id',
            foreignField: 'record_id',
            as: 'cdp'
          }
        },
        {
          $unwind: {
            path: "$cdp",
            preserveNullAndEmptyArrays: false // on garde seulement ceux qui ont un cdp lié
          }
        },
        {
          $match: {
            "cdp.date": { $gte: date_debut, $lt: date_fin },
            statut: { $in: ["Présent", "Positionné"] },
            est_be: "Oui" // uniquement ceux marqués BE
          }
        },
        {
          $group: {
            _id: "$benevole_id", // Groupement par bénévole
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lte: ["$count", 1] }, then: "1" },
                  { case: { $eq: ["$count", 2] }, then: "2" },
                  { case: { $gte: ["$count", 3] }, then: "3+" }
                ],
                default: "Autre"
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            type: "$_id",
            count: 1,
            _id: 0
          }
        }
      ]).toArray();
      console.log(raw);
      return raw;
    }

    async getViewData(date_debut, date_fin) {
      const connection = this.mongodb.client.db('test');
      const cdp = connection.collection("cdps");
      const cdpenrbenev = connection.collection("cdpenrbenevs");
      const cdpenrcand = connection.collection("cdpenrcands");
      const cdpsuivi = connection.collection("cdpsuivis");
      const bienetreenrcand = connection.collection("bienetreenrcands");
      const atcoenrcand = connection.collection("atcoenrcands");
      const contactdestructure = connection.collection("contactdestructures");
      const candidat = connection.collection("candidats");
      const benev = connection.collection("benevs");
      const structures = connection.collection("structures");
      const referents = connection.collection("contactdestructures");
      const atCo = connection.collection("atcos");
      const bienEtre = connection.collection("bienetres");
      const matching = connection.collection("cdpenrcandxcdpenrbenevs");
      const evenement_pc = connection.collection("evenementpcs");

      date_debut = new Date(date_debut);
      date_fin = new Date(date_fin);
      let result = {label: "Pôle Vêtement",
      nb_collecte: 0,
      nb_tri: 0,
      nb_collabs: 0,
      array_one: [],
      nb_fresque: 0,
    }
      const nb_venues_ateliers = await this.get_nb_repartition(cdpenrbenev, date_debut, date_fin);
      const nb_collecte = await this.get_tmp_nb_collecte(evenement_pc, date_debut, date_fin);
      const nb_tri = await this.get_tmp_nb_tri(evenement_pc, date_debut, date_fin);
      const nb_fresque = await this.get_tmp_nb_fresque(evenement_pc, date_debut, date_fin);
      const nb_benevoles = await this.get_nb_benevoles_unique(cdpenrbenev, date_debut, date_fin);
      result.array_one = nb_venues_ateliers;
      result.nb_collecte = nb_collecte[0]?.count || 0;
      result.nb_tri = nb_tri[0]?.count || 0;
      result.nb_fresque = nb_fresque[0]?.count || 0;
      result.nb_collabs = nb_benevoles[0]?.benevolesUniques || 0;
      return result;
    }
}

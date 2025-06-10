import { Injectable } from '@nestjs/common';
import { MongoDbService } from '../mongo-db/mongo-db.service';

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
      let nbBenevolesUniquesAncien_semaine = await cdpenrbenev.aggregate([
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
      let nbBenevolesUniques_semaine = await cdpenrbenev.aggregate([
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

async getMobilCollab(cdpenrbenev, start, end) {
    let nbBenevolesByMonth = await cdpenrbenev.aggregate([
        {
          $match: {
            benevole_id: { $ne: null },
            date_atelier: { $gte: start, $lt: end },
            est_be: { $eq: "Oui" },
            statut: { $in: ["Présent", "Positionné"] }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$date_atelier" },
              month: { $month: "$date_atelier" }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1
          }
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            count: 1
          }
        }
    ]).toArray();
    
    return nbBenevolesByMonth;
}

async getMobilCollabUniques(cdpenrbenev, start, end) {
    let nbBenevolesByMonth = await cdpenrbenev.aggregate([
        {
            $match: {
                benevole_id: { $ne: null },
                date_atelier: { $gte: start, $lt: end },
                est_be: { $eq: "Oui" },
                statut: { $in: ["Présent", "Positionné"] }
            }
        },
        {
            $sort: {
                benevole_id: 1,
                date_atelier: 1
            }
        },
        {
            $group: {
                _id: {
                    benevole_id: "$benevole_id",
                    year: { $year: "$date_atelier" }
                },
                firstDate: { $first: "$date_atelier" }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$firstDate" },
                    month: { $month: "$firstDate" }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                "_id.year": 1,
                "_id.month": 1
            }
        },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                count: 1
            }
        }
    ]).toArray();

    return nbBenevolesByMonth;
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

        const nbBenevolesUniques_semaine = await this.get_nb_benevoles_unique(cdpenrbenev, startOfWeek, endOfWeek);

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
            from: 'cdps',
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
            est_be: "Oui" // uniquement les BE
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
      return raw;
    }

      async get_nb_atelier_moyen(cdp_enr_benev, date_debut, date_fin) {
      const raw = await cdp_enr_benev.aggregate([
        {
          $lookup: {
            from: 'cdps',
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
            statut: { $in: ["Présent"] },
            est_be: "Oui" // uniquement les BC
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
          _id: null,
          averageCount: { $avg: "$count" }  // Moyenne des counts (nb de cdp_enr_benev par bénévole)
          }
        }
      ]).toArray();
      console.log(raw);
        return raw.length > 0 ? parseFloat(raw[0].averageCount.toFixed(2)) : 0;
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
      const date_debut_collab = new Date(date_debut.getFullYear() - 1, 0, 1); // Premier jour du mois de début
      const date_fin_collab = new Date(date_fin.getFullYear(), 11, 31); // Dernier jour du mois de fin
      let result = {label: "Pôle Vêtement",
      nb_collecte: 0,
      nb_tri: 0,
      nb_collabs: 0,
      array_one: [],
      nb_fresque: 0,
      nb_atelier_moyen_par_be: 0,
      nbCollabsByMonth: [],
      nbCollabsByMonthUnique: [],
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
      result.nb_atelier_moyen_par_be = await this.get_nb_atelier_moyen(cdpenrbenev, date_debut, date_fin);
      result.nbCollabsByMonth = await this.getMobilCollab(cdpenrbenev, date_debut_collab, date_fin_collab);
      result.nbCollabsByMonthUnique = await this.getMobilCollabUniques(cdpenrbenev, date_debut_collab, date_fin_collab);
      return result;
    }
}

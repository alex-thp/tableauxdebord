import { Injectable } from '@nestjs/common';
import { count } from 'console';
import e from 'express';
import { stat } from 'fs';
import { get } from 'mongoose';
import { EvenementBenev } from 'src/models';
import { MongoDbService } from 'src/mongo-db/mongo-db.service';

@Injectable()
export class StatsBenevoleService {
    constructor(private mongodb: MongoDbService) {}
    
    async get_nb_benevoles_unique(cdpenrbenev, date_debut, date_fin) {
      const nbBenevolesUniques = await cdpenrbenev.aggregate([
        {
          $match: {
            benevole_id: { $ne: null },
            date_atelier: { $gte: date_debut, $lt: date_fin },
            est_be: { $ne: "Oui" }, //N'est pas BE
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

    async get_nb_nouveau_benevole_unique(cdpenrbenev, date_debut, date_fin) {
      const nbBenevolesUniquesAncien = await cdpenrbenev.aggregate([
        {
          $match: {
            benevole_id: { $ne: null },
            date_atelier: { $ne: null },
            statut: { $in: ["Présent", "Positionné"] },
            est_be: { $ne: "Oui" } //N'est pas BE
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
              $gte: date_debut,
              $lt: date_fin
            }
          }
        },
        {
          $count: "benevolesUniques"
        }
      ]).toArray();
      return nbBenevolesUniquesAncien;
    }

    async get_nb_actions_benev(evenement_benev, date_debut, date_fin) {
      const nb_actions_benev = await evenement_benev.aggregate([
        {
            $match: {date: { $gte: date_debut, $lt: date_fin },}
        },
        {
            $count: "count"
        }
    ]).toArray();
    return nb_actions_benev;
    }

    async get_nb_benevole_unique_semaine(cdpenrbenev, startOfWeek, endOfWeek) {
      const nbBenevolesUniques_semaine = await cdpenrbenev.aggregate([
        {
          $match: {
            benevole_id: { $ne: null },
            date_atelier: { $gte: startOfWeek, $lt: endOfWeek },
            est_be: { $ne: "Oui" }, //N'est pas BE
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

    async get_nb_nouveau_benevole_unique_semaine(cdpenrbenev, startOfWeek, endOfWeek) {
      const nbBenevolesUniquesAncien_semaine = await cdpenrbenev.aggregate([
        {
          $match: {
            benevole_id: { $ne: null },
            date_atelier: { $ne: null },
            statut: { $in: ["Présent", "Positionné"] }
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

    async get_nb_cdp_semaine(cdp, startOfWeek, endOfWeek) {
      const nbcdp_semaine = await cdp.aggregate([
        {
          $match: {
            date: { $gte: startOfWeek, $lt: endOfWeek }
          }
        },
        {
          $group: {
            _id: "$mobile_vehicule",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            mobile_vehicule: "$_id",
            count: 1
          }
        },
        {
          $sort: { mobile_vehicule: 1 }
        }
      ]).toArray();
      return nbcdp_semaine;
    }

    async nb_cdp_totaux_semaine(cdpenrbenev, startOfWeek, endOfWeek) {
      const nbCdpsTotaux_semaine = await cdpenrbenev.aggregate([
        {
          $match: {
            benevole_id: { $ne: null },
            date_atelier: { $ne: null, $gte: startOfWeek, $lt: endOfWeek },
            statut: { $in: ["Présent", "Positionné"] }
          }
        },
        {
          $count: "cdpsTotaux"
        }
      ]).toArray();
      return nbCdpsTotaux_semaine;
    }

    async getMainData(date_debut, date_fin) {
        date_debut = new Date(date_debut);
        date_fin = new Date(date_fin);
        
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
        const evenement_benev = connection.collection("evenementbenevs");

        let today = new Date();
        let startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        let endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

        const nbBenevolesUniques = await this.get_nb_benevoles_unique(cdpenrbenev, date_debut, date_fin);
        const nbBenevolesUniquesAncien = await this.get_nb_nouveau_benevole_unique(cdpenrbenev, date_debut, date_fin);
        const nb_actions_benev = await this.get_nb_actions_benev(evenement_benev, date_debut, date_fin);
        const nbBenevolesUniques_semaine = await this.get_nb_benevole_unique_semaine(cdpenrbenev, startOfWeek, endOfWeek);
        const nbBenevolesUniquesAncien_semaine = await this.get_nb_nouveau_benevole_unique_semaine(cdpenrbenev, startOfWeek, endOfWeek);

        let result = {
            label: "Pôle Bénévole", 
            left: {
                label: '2025', 
                nb_benevole: 0, 
                nv_benevole: 0, 
                nb_action: 0,
            }, 
            right: {
                label: 'Cette semaine', 
                nb_benevole: 0, 
                nv_benevole: 0, 
                remplissage: 0,
            }};

        const nbcdp_semaine = await this.get_nb_cdp_semaine(cdp, startOfWeek, endOfWeek);
        const nbCdpsTotaux_semaine = await this.nb_cdp_totaux_semaine(cdpenrbenev, startOfWeek, endOfWeek);

        let nb_remplissage_semaine = nbcdp_semaine.reduce((total, item) => {
          switch (item.mobile_vehicule) {
            case "BIG":
              return total + item.count * 6;
            case "MINI TRMBL":
              return total + item.count * 3;
            case "MINI CAP18":
              return total + item.count * 3;
            case "":
              case null:
                return total + item.count * 8;
            default:
              return total;
          }
        }, 0);
              
        let remplissage_semaine = (nbCdpsTotaux_semaine[0]?.cdpsTotaux / nb_remplissage_semaine ) * 100 || 0;
        remplissage_semaine = parseFloat(remplissage_semaine.toFixed(2));

        result.left.nb_benevole = nbBenevolesUniques[0]?.benevolesUniques || 0;
        result.left.nv_benevole = nbBenevolesUniquesAncien[0]?.benevolesUniques || 0;
        result.left.nb_action = nb_actions_benev[0]?.count || 0;

        result.right.nb_benevole = nbBenevolesUniques_semaine[0]?.benevolesUniques || 0;
        result.right.nv_benevole = nbBenevolesUniquesAncien_semaine[0]?.benevolesUniques || 0;
        result.right.remplissage = remplissage_semaine || 0;
    return result;
  }

  //      array_one: [{type: "Moins de trente ans", count: 3}, {type: "QPV", count: 6}, {type: "PPSMJ", count: 9}, {type: "RQTH", count: 3}],

  async get_nb_session_acc(evenement_benev, date_debut, date_fin) {
    const nb_session_acc = await evenement_benev.aggregate([
      {
        $match: {
          date: { $gte: date_debut, $lt: date_fin },
          theme: { $eq: "Session d'accueil" },
        }
      },
      {
        $count: "count",
      },
    ]).toArray();
    return nb_session_acc;
  }

  async get_nb_sensi(evenement_benev, date_debut, date_fin) {
    const raw = await evenement_benev.aggregate([
      {
        $match: {
          date: { $gte: date_debut, $lt: date_fin },
          theme: {
            $in: [
              "Sensibilisation : EPA", 
              "Sensibilisation : PPSMJ", 
              "Sensibilisation : RQTH", 
              "Sensibilisation : Santé Mentale",
              "Sensibilisation : QPV",
              "Sensibilisation : Femmes",
              "Sensibilisation : Personnes en situation de précarité et d'isolement",
              "Sensibilisation : LGBTQIA+",
            ]
          }
        }
      },
      {
        $group: {
          _id: "$theme",
          count: { $sum: 1 },
        }
      },
      {
        $project: {
          type: "$_id",
          count: 1,
          count_presents: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    const count = raw.reduce((acc, item) => acc + item.count_presents, 0);
    const total = raw.reduce((acc, item) => acc + item.count, 0);
    return {
      total, // total tous thèmes confondus
      count, // total global de présences tous thèmes confondus
      repartition: raw // tableau avec le détail par thème
    }
  }

  async get_nb_present_sensi(evenement_benev, date_debut, date_fin) {
    const raw = await evenement_benev.aggregate([
      {
        $match: {
          date: { $gte: date_debut, $lt: date_fin },
          theme: { $regex: "^Sensibilisation", $options: "i" }
        }
      },
      {
        $lookup: {
          from: "evenementbenevxbenevs",
          localField: "evenement_benevole_x_benevole_record_id",
          foreignField: "record_id",
          as: "benevole"
        }
      },
      { $unwind: "$benevole" },
      {
        $match: {
          "benevole.statut": { $eq: "Présent" }
        }
      },
      {
        $count: "count"
      }
    ]).toArray();

    return raw;
  }
  
  async get_nb_benev_session_accueil(
    evenement_benev_x_benev: any,
    date_debut: Date,
    date_fin: Date,
  ): Promise<{ total: number; avec_date_premier_atelier: number }> {
    const result = await evenement_benev_x_benev.aggregate([
      {
        $match: {
        statut: { $eq: "Présent" },
      }
    },
      // Jointure avec les événements
      {
        $lookup: {
          from: 'evenementbenevs',
          localField: 'evenement_benevole_record_id',
          foreignField: 'record_id',
          as: 'evenement',
        },
      },
      { $unwind: '$evenement' },
  
      // Filtrage sur la date de l’événement lié et statut Présent
      {
        $match: {
          'evenement.date': { $gte: date_debut, $lt: date_fin },
        },
      },
  
      // Groupement par bénévole (on déduplique ici)
      {
        $group: {
          _id: '$benevole_record_id', // Attention ici : on utilise bien le record_id pour joindre après
        },
      },
  
      // Jointure avec la collection des bénévoles
      {
        $lookup: {
          from: 'benevs',
          localField: '_id',
          foreignField: 'record_id',
          as: 'benevole',
        },
      },
      { $unwind: '$benevole' },
      // Ajout d’un champ booléen pour indiquer si la date existe
      {
        $addFields: {
          a_date_premier_atelier: {
            $cond: [
              { $ne: ['$benevole.date_premier_atelier', null] },
              true,
              false,
            ],
          },
        },
      },
  
      // Résumé final
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avec_date_premier_atelier: {
            $sum: {
              $cond: ['$a_date_premier_atelier', 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          avec_date_premier_atelier: 1,
        },
      },
    ]).toArray();  
    return result[0] ?? { total: 0, avec_date_premier_atelier: 0 };
  }

  async get_nb_presence_atelier_benev(cdpenrbenev, date_debut, date_fin) {
    const nb_presence_atelier_benev = await cdpenrbenev.aggregate([
      {
        $match: {
          benevole_id: { $ne: null },
          date_atelier: { $gte: date_debut, $lt: date_fin },
          est_be: { $ne: "Oui" }, //N'est pas BE
          statut: { $in: ["Présent", ""] }
        }
      },
      {
        $count: "count"
      }
    ]).toArray();
    return nb_presence_atelier_benev;
  }

  async get_nb_presence_atelier_benev_93_95(cdpenrbenev, date_debut, date_fin) {
    const nb_presence_atelier_benev_93_95 = await cdpenrbenev.aggregate([
      {
        $match: {
          benevole_id: { $ne: null },
          date_atelier: { $gte: date_debut, $lt: date_fin },
          est_be: { $ne: "Oui" }, //N'est pas BE
          statut: { $eq: "Présent" },
          lieu_atelier: {
            $regex: "\\((93|95)[0-9]{3}\\)",
            $options: "i"
          }
        }
      },
      {
        $count: "count"
      }
    ]).toArray();
    return nb_presence_atelier_benev_93_95;
  }

  async getViewData(date_debut, date_fin) {

    date_debut = new Date(date_debut);
    date_fin = new Date(date_fin);
    
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
    const evenement_benev = connection.collection("evenementbenevs");
    const evenement_benev_x_benev = connection.collection("evenementbenevxbenevs");
    let result = {
      label: "Pôle Bénévole",
      nb_session_acc: 0,
      nv_benevole: 0,
      benev_en_atelier: 0,
      nb_sensi: 0,
      array_one: [],
      nb_present_sensi: 0,
      nb_action_benev: 0,
      nb_actions_93_95: 0,
    };

    const nb_session_acc = await this.get_nb_session_acc(evenement_benev, date_debut, date_fin);
    const nb_benev_session_accueil = await this.get_nb_benev_session_accueil(evenement_benev_x_benev, date_debut, date_fin);
    const nb_sensi = await this.get_nb_sensi(evenement_benev, date_debut, date_fin);
    const nb_present_sensi = await this.get_nb_present_sensi(evenement_benev, date_debut, date_fin);
    const nb_presence_atelier_benev = await this.get_nb_presence_atelier_benev(cdpenrbenev, date_debut, date_fin);
    const nb_presence_atelier_benev_93_95 = await this.get_nb_presence_atelier_benev_93_95(cdpenrbenev, date_debut, date_fin);

    result.nb_session_acc = nb_session_acc[0]?.count || 0;
    result.nv_benevole = nb_benev_session_accueil?.total || 0;
    result.benev_en_atelier = nb_benev_session_accueil?.avec_date_premier_atelier || 0;
    result.nb_sensi = nb_sensi?.total || 0;
    result.array_one = nb_sensi?.repartition || [];
    result.nb_present_sensi = nb_present_sensi[0]?.count || 0;
    result.nb_action_benev = nb_presence_atelier_benev[0]?.count || 0;
    result.nb_actions_93_95 = nb_presence_atelier_benev_93_95[0]?.count || 0;
    return result;
  }
}

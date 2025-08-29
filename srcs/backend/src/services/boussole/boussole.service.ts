import { Injectable } from '@nestjs/common';
import { MongoDbService } from '../mongo-db/mongo-db.service';

@Injectable()
export class BoussoleService {

    constructor(private mongodb: MongoDbService) {}
    
    async getBoussoleData(date_debut, date_fin) {

        date_debut = new Date(date_debut);
        date_fin = new Date(date_fin);

        let data = { accompagnement : {
                        nb_cand_cdp_fixe : 0, 
                        nb_cand_cdp_mobile : 0, 
                        nb_cand_at_co : 0,
                        nb_cand_bien_etre : 0,
                        nb_cand_mentorat : 0, // TODO une fois en base
                        nb_cand_cdp_et_at_co : 0,
                        nb_absent_cdp : 0,
                        nb_absent_bien_etre : 0,
                        nb_cand_qpv_fixe : 0,
                        nb_cand_qpv_mobile : 0,
                        nb_fin_parcours : 0,
                        nb_remob : 0,
                        taux_satisfaction_cdp : 0,
                        taux_sortie_positive_fin_parcours : 0,
                        taux_sortie_positive_remob : 0,
                        taux_sortie_negative_fin_parcours : 0,
                        taux_sortie_negative_remob : 0,
                        nb_cand_unique_at_co : 0,
                        nb_cand_unique_at_co_avec_cdp : 0,
                    }, 
                    benevoles: {
                        nb_actions_benevole_mobilisees : 0,
                        nb_actions_benevole_mobilisees_93_95 : 0,
                        nb_ateliers_par_benevole_unique : 0,
                        nb_nouveaux_benevoles_session_accueil : 0,
                        taux_transformation_session_accueil : 0,
                        nb_evenements_sensi_visites : 0,
                        nb_participants_uniques_sensi_visites : 0,
                        nb_venues_ateliers : { "1x": 0, "2x": 0, "3x": 0, "4x et plus": 0 },
                        pourcent_be_vs_bc : 0,
                        pourcent_benevoles_adherents : 0,
                        taux_satisfaction_utilite_benevolat : 0,
                    },
                    pc: {
                        nb_collectes : 0,
                        nb_tri : 0,
                        nb_collab : 0,
                        nb_collab_plus_un_atelier : 0,
                        nb_ateliers_par_collab_unique : 0,
                        nb_collab_3x_plus : 0,
                        taux_satisfaction_collecte : 0, // TODO une fois en base
                        taux_satisfaction_tri : 0, // TODO une fois en base
                        pourcent_souhaitant_engager : 0, // TODO une fois en base, personnes souhaitant s'engager en tant que bénévole post tri
                        nb_cdp_moyen_be: 0,
                    } };
        
        data.accompagnement = await this.getAccompagnementData(date_debut, date_fin);
        data.pc = await this.getPcData(date_debut, date_fin);
        data.benevoles = await this.getBenevolesData(date_debut, date_fin);
        
        return data;
    }

    async getBenevolesData(date_debut: Date, date_fin: Date) {
        const connection = this.mongodb.client.db('test');
        const benev = connection.collection("benevs");
        const cdpenrbenev = connection.collection("cdpenrbenevs");
        const evenementbenevxbenev = connection.collection("evenementbenevxbenevs");
        const evenementbenev = connection.collection("evenementbenevs");
    
        let data = {
                        nb_actions_benevole_mobilisees : 0,
                        nb_actions_benevole_mobilisees_93_95 : 0,
                        nb_ateliers_par_benevole_unique : 0,
                        nb_nouveaux_benevoles_session_accueil : 0,
                        taux_transformation_session_accueil : 0,
                        nb_evenements_sensi_visites : 0,
                        nb_participants_uniques_sensi_visites : 0,
                        nb_venues_ateliers : { "1x": 0, "2x": 0, "3x": 0, "4x et plus": 0 },
                        pourcent_be_vs_bc : 0,
                        pourcent_benevoles_adherents : 0,
                        taux_satisfaction_utilite_benevolat : 0,
                    };

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

        const repart_benev_nb_atelier = await cdpenrbenev.aggregate([
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
            est_be: { $ne: "Oui"} // uniquement les BC
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
                  { case: { $eq: ["$count", 3] }, then: "3" },
                  { case: { $gte: ["$count", 4] }, then: "4+" }
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

        const nb_benev_session_accueil = await evenementbenevxbenev.aggregate([
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
        // Groupement par bénévole
        {
          $group: {
            _id: '$benevole_record_id',
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

      const nb_present_sensi = await evenementbenev.aggregate([
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

    const nb_evenement_sensi = await evenementbenev.aggregate([
      {
        $match: {
          date: { $gte: date_debut, $lt: date_fin },
          theme: { $regex: "^Sensibilisation", $options: "i" }
        }
      },
      {
        $count: "count"
      }
    ]).toArray();

    const nb_present_unique_sensi = await evenementbenev.aggregate([
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
    $match: { "benevole.statut": "Présent" }
  },
  {
    $group: {
      _id: "$benevole.benevole_record_id" // groupe par bénévole unique
    }
  },
  {
    $count: "count"
  }
]).toArray();


    const benevoles = await benev.aggregate([
    // 1. Jointure avec les enregistrements CdpEnrBenev
    {
      $lookup: {
        from: "cdpenrbenevs",
        localField: "cdp_x_benev",   // tableau d'IDs côté benevs
        foreignField: "record_id",   // champ côté cdpenrbenevs
        as: "enrs"
      }
    },

    // 2. Garder uniquement les bénévoles avec au moins un enregistrement
    { $match: { "enrs.0": { $exists: true } } },

    // 3. Extraire le dernier enregistrement (celui avec la date_atelier la plus récente)
    {
      $addFields: {
        dernier_enr: {
          $arrayElemAt: [
            {
              $slice: [
                {
                  $sortArray: {
                    input: "$enrs",
                    sortBy: { date_atelier: 1 }
                  }
                },
                -1
              ]
            },
            0
          ]
        }
      }
    },

    // 4. Garder seulement si le dernier enregistrement est après date_debut
    {
      $match: {
        "dernier_enr.date_atelier": { $gt: date_debut }
      }
    },

    // 5. Grouper par est_be Oui / Non
    {
      $group: {
        _id: {
          est_be: {
            $cond: [
              { $eq: ["$dernier_enr.est_be", "Oui"] },
              "Oui",
              "Non"
            ]
          }
        },
        count: { $sum: 1 }
      }
    }
  ]).toArray();

const result = await cdpenrbenev.aggregate([
  {
    $match: {
      date_atelier: { $gte: date_debut, $lt: date_fin },
      statut: "Présent"
    }
  },
  {
    $group: {
      _id: "$intervention_utile",
      count: { $sum: 1 }
    }
  },
  {
    $group: {
      _id: null,
      total: { $sum: "$count" },
      tout_a_fait_pertinent: {
        $sum: {
          $cond: [{ $eq: ["$_id", "Tout à fait pertinent"] }, "$count", 0]
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      total: 1,
      tout_a_fait_pertinent: 1,
      pourcentage: { $multiply: [{ $divide: ["$tout_a_fait_pertinent", "$total"] }, 100] }
    }
  }
]).toArray();

        data.nb_actions_benevole_mobilisees = await nb_presence_atelier_benev[0]?.count || 0;
        data.nb_actions_benevole_mobilisees_93_95 = await nb_presence_atelier_benev_93_95[0]?.count || 0;
        data.nb_ateliers_par_benevole_unique = await repart_benev_nb_atelier.length > 0 ? parseFloat((data.nb_actions_benevole_mobilisees / repart_benev_nb_atelier.reduce((sum, item) => sum + item.count, 0)).toFixed(2)) : 0; // A checker
        data.nb_venues_ateliers["1x"] = await repart_benev_nb_atelier.find(item => item.type === "1")?.count || 0;
        data.nb_venues_ateliers["2x"] = await repart_benev_nb_atelier.find(item => item.type === "2")?.count || 0;
        data.nb_venues_ateliers["3x"] = await repart_benev_nb_atelier.find(item => item.type === "3")?.count || 0;
        data.nb_venues_ateliers["4x et plus"] = await repart_benev_nb_atelier.find(item => item.type === "4+")?.count || 0;
        data.nb_nouveaux_benevoles_session_accueil = await nb_benev_session_accueil[0]?.total || 0;
        data.taux_transformation_session_accueil = await nb_benev_session_accueil[0] && nb_benev_session_accueil[0].total > 0 ? parseFloat(((nb_benev_session_accueil[0].avec_date_premier_atelier) / nb_benev_session_accueil[0].total * 100).toFixed(2)) : 0;
        data.nb_evenements_sensi_visites = await nb_evenement_sensi[0]?.count;
        data.nb_participants_uniques_sensi_visites = nb_present_unique_sensi[0]?.count || 0;

        const ouiCount = await benevoles.find(r => r._id.est_be === "Oui")?.count || 0;
        const nonCount = await benevoles.find(r => r._id.est_be === "Non")?.count || 0;
        const total = ouiCount + nonCount;
        const pourcentBE = total > 0 ? (ouiCount / total) * 100 : 0;

        data.pourcent_be_vs_bc = parseFloat(pourcentBE.toFixed(2));
        data.taux_satisfaction_utilite_benevolat =
          result[0] && data.nb_actions_benevole_mobilisees > 0
          ? parseFloat(((result[0].tout_a_fait_pertinent / result[0].total) * 100).toFixed(2))
          : 0;

        return data;
    }

    async getPcData(date_debut, date_fin) {
        const connection = this.mongodb.client.db('test');
        const evenement_pc = connection.collection("evenementpcs");
        const cdpenrbenev = connection.collection("cdpenrbenevs");

        let data = {
                        nb_collectes : 0,
                        nb_tri : 0,
                        nb_collab : 0,
                        nb_collab_plus_un_atelier : 0, //comptage des collabs venus 2x ou plus
                        nb_ateliers_par_collab_unique : 0,
                        nb_collab_3x_plus : 0, //comptage des collabs venus 3x ou plus
                        taux_satisfaction_collecte : 0,
                        taux_satisfaction_tri : 0,
                        pourcent_souhaitant_engager : 0, //personnes souhaitant s'engager en tant que bénévole post tri
                        nb_cdp_moyen_be: 0,
                    }

        let nb_collecte = await evenement_pc.aggregate([
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

        let nb_tri = await evenement_pc.aggregate([
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

        const raw = await cdpenrbenev.aggregate([
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

      const nb_cdp_moyen_be = await cdpenrbenev.aggregate([
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
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          "cdp.date": { $gte: date_debut, $lt: date_fin },
          statut: "Présent", // uniquement "Présent"
          est_be: "Oui"      // uniquement les BE
        }
      },
      {
        $group: {
          _id: "$benevole_id",     // par bénévole
          nb_cdp_present: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,                               // regrouper tout le monde
          moyenne_cdp: { $avg: "$nb_cdp_present" } // moyenne des nb_cdp_present
        }
      },
      {
        $project: {
          _id: 0,
          moyenne_cdp: 1
        }
      }
    ]).toArray();

        data.nb_collectes = await nb_collecte[0]?.count || 0;
        data.nb_tri = await nb_tri[0]?.count || 0;
        data.nb_collab = await nbBenevolesUniques[0]?.benevolesUniques || 0;
        data.nb_collab_3x_plus = await raw.find(item => item.type === "3+")?.count || 0;
        data.nb_collab_plus_un_atelier = await (raw.find(item => item.type === "2")?.count || 0) + data.nb_collab_3x_plus;
        data.nb_cdp_moyen_be = await nb_cdp_moyen_be[0]?.moyenne_cdp ? parseFloat(nb_cdp_moyen_be[0].moyenne_cdp.toFixed(2)) : 0;
        return data;
    }

    async getAccompagnementData(date_debut, date_fin) {
        const connection = this.mongodb.client.db('test');
        const cdpenrcand = connection.collection("cdpenrcands");
        const atcoenrcand = connection.collection("atcoenrcands");
        const bienetreenrcand = connection.collection("bienetreenrcands");
        const cdpsuivi = connection.collection("cdpsuivis");

        let data = { nb_cand_cdp_fixe : 0, 
                     nb_cand_cdp_mobile : 0,
                     nb_cand_at_co : 0,
                     nb_cand_bien_etre : 0,
                     nb_cand_mentorat : 0, // à implémenter une fois que le mentorat sera dans Airtable
                     nb_cand_cdp_et_at_co : 0,
                     nb_absent_cdp : 0,
                     nb_absent_bien_etre : 0,
                     nb_cand_qpv_fixe : 0,
                     nb_cand_qpv_mobile : 0,
                     nb_fin_parcours : 0,
                     nb_remob : 0,
                     taux_satisfaction_cdp : 0,
                     taux_sortie_positive_fin_parcours : 0,
                     taux_sortie_positive_remob : 0, 
                     taux_sortie_negative_fin_parcours : 0,
                     taux_sortie_negative_remob : 0,
                     nb_cand_unique_at_co : 0,
                     nb_cand_unique_at_co_avec_cdp : 0,
                    };

        const nbCandCdpFixeResult = await cdpenrcand.aggregate([
        {
          $match: {
            date_atelier: { $gte: date_debut, $lt: date_fin },
            statut: "Présent",
            type_atelier: "CDP FIXE"
          }
        },
        {
          $count: "count"
        }
        ]).toArray();

        const nbCandCdpMobileResult = await cdpenrcand.aggregate([
        {
          $match: {
            date_atelier: { $gte: date_debut, $lt: date_fin },
            statut: "Présent",
            type_atelier: "CDP MOBILE"
          }
        },
        {
          $count: "count"
        }
        ]).toArray();

        const nb_cand_at_co = await atcoenrcand.aggregate([
        {
            $match: {
                date_atelier: { $gte: date_debut, $lt: date_fin },
            },
        },
        {
            $facet: {
                // Total brut (chaque ligne = une participation)
                total_candidats: [
                    { $count: "count" }
                ],

                // Candidats uniques ayant un CDP
                candidats_avec_cdp: [
                {
                    $match: {
                        a_deja_fait_cdp: { $ne: "" }
                    }
                },
                {
                    $group: {
                        _id: "$candidat_record_id"
                    }
                },
                {
                    $count: "count"
                }
                ],
            }
        },
        {
            $project: {
                total_candidats: { $ifNull: [{ $arrayElemAt: ["$total_candidats.count", 0] }, 0] },
                candidats_avec_cdp: { $ifNull: [{ $arrayElemAt: ["$candidats_avec_cdp.count", 0] }, 0] },
            }
        }
        ]).toArray();

        const nb_cand_at_co_unique = await atcoenrcand.aggregate([
        {
          $match: {
            date_atelier: { $gte: date_debut, $lt: date_fin },
          },
        },
        {
          $facet: {
            // Candidats uniques (chaque candidat ne compte qu’une fois)
            total_candidats: [
            {
              $group: {
              _id: "$candidat_record_id",
              },
            },
            { $count: "count" }
            ],

            // Candidats uniques ayant déjà fait un CDP
            candidats_avec_cdp: [
            {
              $match: {
                a_deja_fait_cdp: { $ne: "" },
              },
            },
            {
              $group: {
                _id: "$candidat_record_id",
              },
            },
            { $count: "count" }
            ],
          },
        },
        {
          $project: {
            total_candidats: {
              $ifNull: [{ $arrayElemAt: ["$total_candidats.count", 0] }, 0],
            },
            candidats_avec_cdp: {
              $ifNull: [{ $arrayElemAt: ["$candidats_avec_cdp.count", 0] }, 0],
            },
          },
        },
      ]).toArray();


        const nb_cand_bien_etre = await bienetreenrcand.aggregate([
        {
          $match: {
            date_atelier: { $gte: date_debut, $lt: date_fin },
            statut: "Présent"
          }
        },
        {
          $lookup: {
            from: "cdpenrcands",
            let: { candId: "$candidat_record_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$candidat_record_id", "$$candId"] },
                      { $eq: ["$statut", "Présent"] }
                    ]
                  }
                }
              }
            ],
            as: "present_cdps"
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            cdp_et_bien_etre: {
              $sum: {
                $cond: [
                  { $gt: [{ $size: "$present_cdps" }, 0] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1,
            cdp_et_bien_etre: 1
          }
        }
        ]).toArray();

        const nb_absent_cdp = await cdpenrcand.aggregate([
            {
              $match: {
                date_atelier: { $gte: date_debut, $lt: date_fin },
                statut: "Absent"
              }
            },
            {
              $count: "count"
            }
          ]).toArray();

        const nb_absent_bien_etre = await bienetreenrcand.aggregate([
        {
            $match: {
                date_atelier: { $gte: date_debut, $lt: date_fin },
                statut: "Absent"
            }
        },
        {
            $count: "count"
        }
        ]).toArray();

        const nb_passage_qpv = await cdpenrcand.aggregate([
        {
          $match: {
            date_atelier: { $gte: date_debut, $lt: date_fin },
            statut: "Présent",
            qpv: "Oui",
            type_atelier: { $in: ["CDP FIXE", "CDP MOBILE"] }
          }
        },
        {
          $group: {
            _id: "$type_atelier",
            count: { $sum: 1 }
          }
        }
        ]).toArray();

        const nb_niveau_lcs = await cdpenrcand.aggregate([
        {
          $match: {
            date_atelier: { $gte: date_debut, $lt: date_fin },
            statut: "Présent",
            qpv: "Oui",
            type_atelier: { $in: ["CDP FIXE", "CDP MOBILE"] }
          }
        },
        {
          $group: {
            _id: "$niveau_lcs",
            count: { $sum: 1 }
          }
        }
        ]).toArray();

        let note_satisfaction = await cdpenrcand.aggregate([
        {
            $match: {
                date_atelier: { $gte: date_debut, $lt: date_fin, },
                statut: "Présent",
                note_satisfaction: { $exists: true, $ne: null }
            }
        },
        {
            $group: {
                _id: null,
                avg_note: { $avg: "$note_satisfaction" }
            }
        },
        {
            $project: {
                _id: 0,
                avg_note: 1
            }
        }	
        ]).toArray();

        let nb_sortie_positive_fin_parcours = await cdpsuivi.aggregate([
        {
          $sort: { date_suivi: -1 } // on trie du plus récent au plus ancien
        },
        {
          $group: {
            _id: "$candidat_record_id",
            latest_suivi: { $first: "$$ROOT" }
          }
        },
        {
          $replaceRoot: { newRoot: "$latest_suivi" }
        },
        {
          $match: {
            date_suivi: { $gte: date_debut, $lt: date_fin },
            niveau_lcs: { $eq: "FIN DE PARCOURS" },
            situation_pro: {
              $in: [
                "CDI",
                "CDD (- de 6 mois)",
                "CDD (6 mois ou +)",
                "En formation",
                "En stage",
                "Auto-entrepreneur / Entrepreneur/ Création entreprise",
                "En alternance / En contrat d'apprentissage",
                "Intérim"
              ]
            }
          }
        },
        {
          $count: "total"
        }
      ]).toArray();

      let nb_sortie_positive_remob = await cdpsuivi.aggregate([
        {
          $sort: { date_suivi: -1 } // on trie du plus récent au plus ancien
        },
        {
          $group: {
            _id: "$candidat_record_id",
            latest_suivi: { $first: "$$ROOT" }
          }
        },
        {
          $replaceRoot: { newRoot: "$latest_suivi" }
        },
        {
          $match: {
            date_suivi: { $gte: date_debut, $lt: date_fin },
            niveau_lcs: { $eq: "REMOBILISATION" },
            situation_pro: {
              $in: [
                "CDI",
                "CDD (- de 6 mois)",
                "CDD (6 mois ou +)",
                "En formation",
                "En stage",
                "Auto-entrepreneur / Entrepreneur/ Création entreprise",
                "En alternance / En contrat d'apprentissage",
                "Intérim"
              ]
            }
          }
        },
        {
          $count: "total"
        }
      ]).toArray();

      let nb_sortie_negative_fin_parcours = await cdpsuivi.aggregate([
        {
          $sort: { date_suivi: -1 } // on trie du plus récent au plus ancien
        },
        {
          $group: {
            _id: "$candidat_record_id",
            latest_suivi: { $first: "$$ROOT" }
          }
        },
        {
          $replaceRoot: { newRoot: "$latest_suivi" }
        },
        {
          $match: {
            date_suivi: { $gte: date_debut, $lt: date_fin },
            niveau_lcs: { $eq: "FIN DE PARCOURS" },
            situation_pro: {
              $nin: [
                "CDI",
                "CDD (- de 6 mois)",
                "CDD (6 mois ou +)",
                "En formation",
                "En stage",
                "Auto-entrepreneur / Entrepreneur/ Création entreprise",
                "En alternance / En contrat d'apprentissage",
                "Intérim"
              ]
            }
          }
        },
        {
          $count: "total"
        }
      ]).toArray();

      let nb_sortie_negative_remob = await cdpsuivi.aggregate([
        {
          $sort: { date_suivi: -1 } // on trie du plus récent au plus ancien
        },
        {
          $group: {
            _id: "$candidat_record_id",
            latest_suivi: { $first: "$$ROOT" }
          }
        },
        {
          $replaceRoot: { newRoot: "$latest_suivi" }
        },
        {
          $match: {
            date_suivi: { $gte: date_debut, $lt: date_fin },
            niveau_lcs: { $eq: "REMOBILISATION" },
            situation_pro: {
              $nin: [
                "CDI",
                "CDD (- de 6 mois)",
                "CDD (6 mois ou +)",
                "En formation",
                "En stage",
                "Auto-entrepreneur / Entrepreneur/ Création entreprise",
                "En alternance / En contrat d'apprentissage",
                "Intérim"
              ]
            }
          }
        },
        {
          $count: "total"
        }
      ]).toArray();

        data.nb_cand_cdp_fixe = await nbCandCdpFixeResult.length > 0 ? nbCandCdpFixeResult[0].count : 0;
        data.nb_cand_cdp_mobile = await nbCandCdpMobileResult.length > 0 ? nbCandCdpMobileResult[0].count : 0;
        data.nb_cand_at_co = await nb_cand_at_co.length > 0 ? nb_cand_at_co[0].total_candidats : 0;
        data.nb_cand_bien_etre = await nb_cand_bien_etre.length > 0 ? nb_cand_bien_etre[0].total : 0;
        data.nb_cand_cdp_et_at_co = await nb_cand_at_co[0]?.candidats_avec_cdp || 0;
        data.nb_cand_unique_at_co = await nb_cand_at_co_unique.length > 0 ? nb_cand_at_co_unique[0].total_candidats : 0;
        data.nb_cand_unique_at_co_avec_cdp = await nb_cand_at_co_unique[0]?.candidats_avec_cdp || 0;
        data.nb_absent_cdp = await nb_absent_cdp.length > 0 ? nb_absent_cdp[0].count : 0;
        data.nb_absent_bien_etre = await nb_absent_bien_etre.length > 0 ? nb_absent_bien_etre[0].count : 0;
        data.nb_cand_qpv_fixe = await nb_passage_qpv.find(item => item._id === "CDP FIXE")?.count || 0;
        data.nb_cand_qpv_mobile = await nb_passage_qpv.find(item => item._id === "CDP MOBILE")?.count || 0;
        data.nb_fin_parcours = await nb_niveau_lcs.find(item => item._id === "FIN DE PARCOURS")?.count || 0;
        data.nb_remob = await nb_niveau_lcs.find(item => item._id === "REMOBILISATION")?.count || 0;
        data.taux_satisfaction_cdp = await note_satisfaction[0]?.avg_note.toFixed(2) || 0;
        data.taux_sortie_positive_fin_parcours = await nb_sortie_positive_fin_parcours[0]?.total || 0;
        data.taux_sortie_positive_remob = await nb_sortie_positive_remob[0]?.total || 0;
        data.taux_sortie_negative_fin_parcours = await nb_sortie_negative_fin_parcours[0]?.total || 0;
        data.taux_sortie_negative_remob = await nb_sortie_negative_remob[0]?.total || 0;

        return data;
    }
}

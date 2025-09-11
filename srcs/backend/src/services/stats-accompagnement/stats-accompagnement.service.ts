import { Injectable } from '@nestjs/common';
import { MongoDbService } from '../mongo-db/mongo-db.service';

@Injectable()
export class StatsAccompagnementService {
    constructor(private mongodb: MongoDbService) {}

    async getMainData(date_debut, date_fin) {
        const connection = this.mongodb.client.db('test');
        const cdpenrcand = connection.collection("cdpenrcands");
        const cdpsuivi = connection.collection("cdpsuivis");

        let result ={label: "Pôle Accompagnement", 
            left: {label: '2025', nb_candidat: 0, nb_suivi : 0, sortie_positive: 0}, 
            right: {label: 'Cette semaine', nb_candidat: 0, remplissage: 0, structure_prescr: 0}};
        let tmp_nb_cand = await cdpenrcand.aggregate([
            {
              $match: {
                date_atelier: { $gte: date_debut, $lt: date_fin },
                statut: "Présent"
              }
            },
            {
              $count: "count"
            }
          ]).toArray();
        let tmp_nb_suivi = await cdpsuivi.aggregate([
            {
                $match: {date_suivi: {$gte: date_debut, $lt: date_fin}}
            }, 
            {
                $count: "count"
            }
        ]).toArray();
        let tmp_nb_sortie_positive = await cdpsuivi.aggregate([
            {
              $match: {
                date_suivi: { $gte: date_debut, $lt: date_fin },
                situation_pro: { $in: [
                  "CDI",
                  "CDD (- de 6 mois)", 
                  "CDD (6 mois ou +)", 
                  "En formation", 
                  "En stage", 
                  "Auto-entrepreneur / Entrepreneur/ Création entreprise", 
                  "En alternance / En contrat d'apprentissage", 
                  "Intérim"
                ] }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 }
              }
            },
            {
              $project: {
                _id: 0,
                total: 1
              }
            }
          ]).toArray();
        result.left.nb_candidat = tmp_nb_cand[0]?.count || 0;
        result.left.nb_suivi = tmp_nb_suivi[0]?.count || 0;
        result.left.sortie_positive = tmp_nb_sortie_positive[0]?.total || 0;
        let today = new Date();
        let startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        let endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        let tmp_nb_cand_semaine = await cdpenrcand.aggregate([
            {
              $match: {
                date_atelier: { $gte: startOfWeek, $lt: endOfWeek },
                statut: "Présent"
              }
            },
            {
              $count: "count"
            }
          ]).toArray();
          let tmp_remplissage_semaine = await cdpenrcand.aggregate([
            {
              $match: {
                date_atelier: { $gte: startOfWeek, $lt: endOfWeek }
              }
            },
            {
              $group: {
                _id: "$statut",      // Grouper par statut
                count: { $sum: 1 }   // Compter le nombre de candidats par statut
              }
            },
            {
              $group: {
                _id: null,
                creneaux_libres: {
                  $sum: {
                    $cond: [{ $eq: ["$_id", "Créneau libre"] }, "$count", 0] // Compter "Créneau Libre"
                  }
                },
                autres: {
                  $sum: {
                    $cond: [{ $ne: ["$_id", "Créneau libre"] }, "$count", 0] // Cumuler tous les autres statuts
                  }
                }
              }
            },
            {
              $project: {
                _id: 0,
                creneaux_libres: 1,
                autres: 1
              }
            }
          ]).toArray();

    let libres = tmp_remplissage_semaine[0]?.creneaux_libres || 0;
    let occupes = tmp_remplissage_semaine[0]?.autres || 0;
    let total = libres + occupes;

    let taux_remplissage = total > 0 ? (occupes / total) * 100 : 0;
    taux_remplissage = parseFloat(taux_remplissage.toFixed(2));

    //reste encore le demande exterieure -> à retirer
    let nb_asso_prescr_semaine = await cdpenrcand.aggregate([
        {
          $match: {
            date_atelier: { $gte: startOfWeek, $lt: endOfWeek }
          }
        },
        {
          $lookup: {
            from: "contactdestructures",
            localField: "prescripteur_record_id",
            foreignField: "record_id",
            as: "contact"
          }
        },
        { $unwind: "$contact" },
        {
          $group: {
            _id: null,
            uniqueStructures: { $addToSet: "$contact.structure_id" }
          }
        },
        {
          $project: {
            _id: 0,
            uniqueStructuresCount: { $size: "$uniqueStructures" }
          }
        }
      ]).toArray();
    result.right.nb_candidat = tmp_nb_cand_semaine[0]?.count || 0;
    result.right.remplissage = taux_remplissage || 0;
    result.right.structure_prescr = nb_asso_prescr_semaine[0]?.uniqueStructuresCount || 0;

    return result;
    }

    async get_nb_passage_cdp(cdpenrcand, date_debut, date_fin) {
      const nb_passage_cdp = await cdpenrcand.aggregate([
        {
          $match: {
            date_atelier: { $gte: date_debut, $lt: date_fin },
            statut: "Présent",
            type_atelier: { $in: ["CDP FIXE", "CDP MOBILE"] }
          }
        },
        {
          $group: {
            _id: "$type_atelier",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            type_atelier: "$_id",
            count: 1
          }
        }
      ]).toArray();

      return nb_passage_cdp;
    }

    async get_nb_absents(cdpenrcand, date_debut, date_fin) {
      const nb_absents_cdp = await cdpenrcand.aggregate([
        { $match: { date_atelier: { $gte: date_debut, $lt: date_fin }, statut: "Absent" } },
        { $group: { _id: null, count: { $sum: 1 } } },
    ]).toArray()
    return nb_absents_cdp;
    }

    async get_nb_qpv(cdpenrcand, date_debut, date_fin) {
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
      return nb_passage_qpv;
    }

    async get_nb_sortie_positive(cdpsuivi, date_debut, date_fin) {
      let tmp_nb_sortie_positive = await cdpsuivi.aggregate([
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
      return tmp_nb_sortie_positive;
    }

    async get_nb_suivis(cdpsuivi, date_debut, date_fin) {
      let tmp_nb_suivis = await cdpsuivi.aggregate([
        {
          $sort: { date_suivi: -1 }
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
            date_suivi: { $gte: date_debut, $lt: date_fin }
          }
        },
        {
          $count: "count"
        }
      ]).toArray();
      return tmp_nb_suivis;
    }

    async get_note_satisfaction(cdpenrcand, date_debut, date_fin) {
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
        return note_satisfaction;
    }

    async get_nb_prescription_cdp_attente(cdpenrcand, date_debut, date_fin) {
      const nb_prescription_cdp_attente = await cdpenrcand.aggregate([
        {
          $match: {
            date_creation: { $gte: date_debut, $lt: date_fin },
            statut: "A Positionner"
          }
        },
        {
          $group: {
            _id: "$type_prescription",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            type_atelier: "$_id",
            count: 1
          }
        }
    ]).toArray();
    return nb_prescription_cdp_attente;
    }

    async get_nb_prescription_cdp(cdpenrcand, date_debut, date_fin) {
      const nb_prescription_cdp = await cdpenrcand.aggregate([
        {
          $match: {
            date_creation: { $gte: date_debut, $lt: date_fin },
          }
        },
        {
          $group: {
            _id: {
              type_atelier: "$type_atelier",
              statut: "$statut"
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.type_atelier",
            statuts: {
              $push: {
                statut: "$_id.statut",
                count: "$count"
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            type_atelier: "$_id",
            statuts: 1
          }
        }
      ]).toArray();
      return nb_prescription_cdp;
    }

    async get_top_structures_par_statut(cdpenrcand, date_debut, date_fin) {
      const top_structures_par_statut = await cdpenrcand.aggregate([
        {
            $match: {
                date_creation: { $gte: date_debut, $lt: date_fin },
                statut: { $in: ["Présent", "Absent", "Positionné", "A Positionner"] },
                prescripteur_record_id: { $ne: null },
                "contact.structure_id": { $ne: "DEMANDE EXTERIEURE (/)" } // Exclure "DEMANDE EXTERIEURE" dans structure_id
            }
        },
        {
            $lookup: {
                from: "contactdestructures",
                localField: "prescripteur_record_id",
                foreignField: "record_id",
                as: "contact"
            }
        },
        {
            $project: {
                statut: 1,
                structure_id: { $arrayElemAt: ["$contact.structure_id", 0] }
            }
        },
        {
            $match: {
                "structure_id": {
                    $nin: ["DEMANDE EXTERIEURE (/)", "", null]  // Exclure "DEMANDE EXTERIEURE", les chaînes vides et les nulls
                }
          }
        },
        {
            $group: {
                _id: { structure_id: "$structure_id", statut: "$statut" },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 } // Trie par nombre de passages décroissant
        },
        {
            $group: {
                _id: "$_id.statut", // Grouper par statut
                topStructures: { $push: { structure_id: "$_id.structure_id", count: "$count" } }
            }
        },
        {
            $project: {
                _id: 0,
                statut: "$_id",
                topStructures: { $slice: ["$topStructures", 3] } // Garde seulement les 3 premiers
            }
        }
    ]).toArray();
    return top_structures_par_statut;
    }

    async get_resultats_structures(cdpenrcand, date_debut, date_fin) {
      const resultats_structures = await cdpenrcand.aggregate([
        {
          $match: {
            date_atelier: { $gte: date_debut, $lt: date_fin },
            statut: { $in: ["Présent", "Absent"] },
            prescripteur_record_id: { $ne: null },
            "contact.structure_id": { $ne: "DEMANDE EXTERIEURE (/)" }
          }
        },
        {
          $lookup: {
            from: "contactdestructures",
            localField: "prescripteur_record_id",
            foreignField: "record_id",
            as: "contact"
          }
        },
        {
          $unwind: "$contact"
        },
        {
          $project: {
            statut: 1,
            structure_id: "$contact.structure_id"
          }
        },
        {
          $match: {
            structure_id: {
              $nin: ["DEMANDE EXTERIEURE (/)", "", null]
            }
          }
        },
        {
          $group: {
            _id: "$structure_id",
            total: { $sum: 1 },
            presents: {
              $sum: {
                $cond: [{ $eq: ["$statut", "Présent"] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            structure_id: "$_id",
            taux_presence: {
              $round: [
                { $multiply: [{ $divide: ["$presents", "$total"] }, 100] },
                2
              ]
            },
            total_passages: "$total",
            _id: 0
          }
        },
        {
          $match: {
            total_passages: { $gte: 10 }
          }
        },
        {
          $facet: {
            meilleures: [
              { 
                $sort: { 
                  taux_presence: -1,  // D'abord par taux décroissant
                  total_passages: -1   // En cas d'égalité, par nombre de passages décroissant
                } 
              },
              { $limit: 3 }
            ],
            moins_bonnes: [
              { 
                $sort: { 
                  taux_presence: 1,   // D'abord par taux croissant
                  total_passages: -1  // En cas d'égalité, par nombre de passages décroissant
                } 
              },
              { $limit: 3 }
            ]
          }
        }
      ]).toArray();
      
      return resultats_structures;
    }

    async get_nb_cand_unique_at_co(atcoenrcand, date_debut, date_fin) {
  const nb_cand_at_co = await atcoenrcand.aggregate([
    {
      $match: {
        date_atelier: { $gte: date_debut, $lt: date_fin },
      },
    },
          {
            $group: {
              _id: "$candidat_record_id"
            }
          },
          {
            $count: "count"
          }
  ]).toArray();

  console.log("Nombre de candidats à l'atelier CO :", nb_cand_at_co[0].count);
  return nb_cand_at_co[0];
}

async get_nb_cand_at_co(atcoenrcand, date_debut, date_fin) {
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

  console.log("Nombre de candidats à l'atelier CO :", nb_cand_at_co[0]);
  return nb_cand_at_co[0];
}


    async get_nb_cand_bien_etre(bienetreenrcand, date_debut, date_fin) {
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
      return nb_cand_bien_etre;
    }

    private genererResumeStructures(resultats: any): string {
      const { meilleures, moins_bonnes } = resultats[0] || { meilleures: [], moins_bonnes: [] };
  
      const formatListe = (liste: any[], titre: string): string => {
        if (!liste.length) return `${titre} : aucune structure disponible.\n`;
  
        let texte = `${titre} :\n`;
        liste.forEach((structure, index) => {
          texte += `  ${index + 1}. ${structure.structure_id} - ` +
                   `Taux de présence : ${structure.taux_presence}% ` +
                   `(Passages : ${structure.total_passages})\n\n`;
        });
        return texte + '\n';
      };
  
      const meilleuresStr = formatListe(meilleures, '🏆 Top 3 des structures avec le meilleur taux de présence');
      const moinsBonnesStr = formatListe(moins_bonnes, '📉 Top 3 des structures avec le plus faible taux de présence');
  
      return meilleuresStr + moinsBonnesStr;
    }

    async getPrescriByMonth(cdpenrcand, date_debut, date_fin) {
    const result = await cdpenrcand.aggregate([
    // 1️⃣ Ne garder que les documents qui ont une date_creation
    { 
      $match: { 
        date_creation: { $gte: date_debut, $lt: date_fin },
    },
  },

    // 2️⃣ Regrouper par année et mois de date_creation
    { 
      $group: {
        _id: {
          year: { $year: "$date_creation" },
          month: { $month: "$date_creation" }
        },
        totalPrescriptions: { $sum: 1 }
      }
    },

    // 3️⃣ Trier du plus ancien au plus récent (facultatif)
    { 
      $sort: { "_id.year": 1, "_id.month": 1 }
    },

    // 4️⃣ Remettre sous forme plus lisible
    { 
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        count: "$totalPrescriptions"
      }
    }
  ]).toArray();

  return result;
}

    async getViewData(date_debut, date_fin) {
        date_debut = new Date(date_debut);
        date_fin = new Date(date_fin);
        const connection = this.mongodb.client.db('test');

        const cdpenrcand = connection.collection("cdpenrcands");
        const cdpsuivi = connection.collection("cdpsuivis");
        const bienetreenrcand = connection.collection("bienetreenrcands");
        const atcoenrcand = connection.collection("atcoenrcands");

        let result =  {
            label: "Pôle Accompagnement",
            nb_passage_cdp_fixe: 0,
            nb_passage_cdp_mobile: 0,
            nb_absents: 0,
            nb_qpv_fixe: 0,
            nb_qpv_mobile: 0,
            nb_sortie_positive: 0,
            nb_suivis: 0,
            note_satisfaction: 0,
            nb_asso_part: 0,
            nb_asso_part_prescr: 0,
            nb_prescr_fixe: 0,
            nb_prescr_mobile: 0,
            nb_prescr_fixe_attente: 0,
            nb_prescr_mobile_attente: 0,
            nb_cand_at_co: 0,
            nb_cand_cdp_et_atco: 0,
            nb_cand_bien_etre: 0,
            nb_cand_cdp_et_bien_etre: 0,
            nb_prescr: 0,
            nb_prescr_attente: 0,
            string_asso_part_prescr: "",
            nb_cand_atco_unique: 0,
            array_prescri_by_month: [],
          };

        const array_prescri_by_month = await this.getPrescriByMonth(cdpenrcand, date_debut, date_fin);

        const nb_passage_cdp = await this.get_nb_passage_cdp(cdpenrcand, date_debut, date_fin);
        const nb_passage_fixe = nb_passage_cdp.find(item => item.type_atelier === "CDP FIXE")?.count || 0;
        const nb_passage_mobile = nb_passage_cdp.find(item => item.type_atelier === "CDP MOBILE")?.count || 0;

        const nb_absents_cdp = await this.get_nb_absents(cdpenrcand, date_debut, date_fin);

        const nb_passage_qpv = await this.get_nb_qpv(cdpenrcand, date_debut, date_fin);
        const nb_passage_qpv_fixe = nb_passage_qpv.find(item => item._id === "CDP FIXE")?.count || 0;
        const nb_passage_qpv_mobile = nb_passage_qpv.find(item => item._id === "CDP MOBILE")?.count || 0;
          
        let tmp_nb_sortie_positive = await this.get_nb_sortie_positive(cdpsuivi, date_debut, date_fin);

        let tmp_nb_suivis = await this.get_nb_suivis(cdpsuivi, date_debut, date_fin);

        let note_satisfaction = await this.get_note_satisfaction(cdpenrcand, date_debut, date_fin);
            
        const nb_prescription_cdp_attente = await this.get_nb_prescription_cdp_attente(cdpenrcand, date_debut, date_fin);
               
        const presc_fixe_attente = nb_prescription_cdp_attente.find(r => r.type_atelier === 'CDP FIXE')?.count || 0;
        const prescr_mobile_attente = nb_prescription_cdp_attente.find(r => r.type_atelier === 'CDP MOBILE')?.count || 0;
        const total_prescr_attente = presc_fixe_attente + prescr_mobile_attente + (nb_prescription_cdp_attente.find(r => r.type_atelier === 'CDP FIXE OU MOBILE')?.count || 0);
              
        const nb_prescription_cdp = await this.get_nb_prescription_cdp(cdpenrcand, date_debut, date_fin);

        const resultFormatted = {};

        for (const item of nb_prescription_cdp) {
            const type = item.type_atelier || "Inconnu";
            resultFormatted[type] = {};

            for (const statutObj of item.statuts) {
                if(statutObj.statut == "") statutObj.statut = "Inconnu";
                resultFormatted[type][statutObj.statut] = statutObj.count;
            }
        }

        const resultats_structures = await this.get_resultats_structures(cdpenrcand, date_debut, date_fin);
        const resultat_structure_string = this.genererResumeStructures(resultats_structures);

        const nb_cand_at_co = await this.get_nb_cand_at_co(atcoenrcand, date_debut, date_fin);
        const nb_candi_unique_at_co = await this.get_nb_cand_unique_at_co(atcoenrcand, date_debut, date_fin);

        const nb_cand_bien_etre = await this.get_nb_cand_bien_etre(bienetreenrcand, date_debut, date_fin);
            
        result.nb_passage_cdp_fixe = nb_passage_fixe || 0;
        result.nb_passage_cdp_mobile = nb_passage_mobile || 0;
        result.nb_absents = nb_absents_cdp[0]?.count || 0;
        result.nb_qpv_fixe = nb_passage_qpv_fixe || 0;
        result.nb_qpv_mobile = nb_passage_qpv_mobile || 0;
        result.nb_sortie_positive = tmp_nb_sortie_positive[0]?.total || 0;
        result.nb_suivis = tmp_nb_suivis[0]?.count || 0;
        result.note_satisfaction = note_satisfaction[0]?.avg_note.toFixed(2) || 0;
        result.nb_prescr_fixe = (resultFormatted['CDP FIXE']?.['Présent'] || 0) + (resultFormatted['CDP FIXE']?.['A Positionner'] || 0) + (resultFormatted["CDP FIXE"]?.["Absent"]|| 0) + (resultFormatted["CDP FIXE"]?.["Positionné"]|| 0);
        result.nb_prescr_mobile = (resultFormatted['CDP MOBILE']?.['Présent'] || 0) + (resultFormatted['CDP MOBILE']?.['A Positionner'] || 0) + (resultFormatted["CDP MOBILE"]?.["Absent"]|| 0) + (resultFormatted["CDP MOBILE"]?.["Positionné"]|| 0);
        result.nb_prescr_fixe_attente = (presc_fixe_attente || 0);
        result.nb_prescr_mobile_attente = (prescr_mobile_attente || 0);
        result.nb_prescr = (resultFormatted['Inconnu']?.['Présent'] || 0) + (resultFormatted['Inconnu']?.['A Positionner'] || 0) + (resultFormatted["Inconnu"]?.["Absent"]|| 0) + (resultFormatted["Inconnu"]?.["Positionné"]|| 0);
        result.nb_prescr_attente = total_prescr_attente;
        result.string_asso_part_prescr = resultat_structure_string//assoPartString;
        result.nb_cand_at_co = nb_cand_at_co?.total_candidats || 0;
        result.nb_cand_cdp_et_atco = nb_cand_at_co?.candidats_avec_cdp || 0;
        result.nb_cand_atco_unique = nb_candi_unique_at_co?.count || 0;
        result.nb_cand_bien_etre = nb_cand_bien_etre[0]?.total || 0;
        result.nb_cand_cdp_et_bien_etre = nb_cand_bien_etre[0]?.cdp_et_bien_etre || 0;
        result.array_prescri_by_month = array_prescri_by_month;

        return result;
    }
}

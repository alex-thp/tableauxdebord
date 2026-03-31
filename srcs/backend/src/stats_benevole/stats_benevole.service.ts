import { MongoDbService } from '../services/mongo-db/mongo-db.service';
import { EventThemeStatsDto } from './dto/event-theme-stats.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StatsBenevoleService {
  constructor(private mongodb: MongoDbService) {}

  async getStatsByTheme(): Promise<EventThemeStatsDto[]> {
    const connection = this.mongodb.client.db('test');

    const evenementbenev = connection.collection('evenementbenevs');
    let date_debut = new Date();
    date_debut.setFullYear(date_debut.getFullYear() - 1);
    let date_fin = new Date();

    const pipeline = [
      {
        $match: {
          date: {
            $gte: date_debut,
            $lt: date_fin,
          },
          statut: 'Validé',
        },
      },
      // 1️⃣ Jointure avec les inscriptions
      {
        $lookup: {
          from: 'evenementbenevxbenevs',
          localField: 'record_id',
          foreignField: 'evenement_benevole_record_id',
          as: 'inscriptions',
        },
      },

      // 2️⃣ Une ligne par inscription
      {
        $unwind: {
          path: '$inscriptions',
          preserveNullAndEmptyArrays: true,
        },
      },

      // 3️⃣ Champs utiles
      {
        $addFields: {
          theme: { $ifNull: ['$theme', null] },
          benevoleId: '$inscriptions.benevole_record_id',
          statut: '$inscriptions.statut',

          // 👇 Présence réelle
          isPresent: {
            $cond: [{ $eq: ['$inscriptions.statut', 'Présent'] }, 1, 0],
          },

          // 👇 Statut pris en compte dans le taux de présence
          isAttendanceRelevant: {
            $cond: [
              { $in: ['$inscriptions.statut', ['Présent', 'Absent']] },
              1,
              0,
            ],
          },
        },
      },

      // 4️⃣ (thème + évènement + bénévole)
      {
        $group: {
          _id: {
            theme: '$theme',
            eventId: '$record_id',
            benevoleId: '$benevoleId',
          },

          isPresent: { $max: '$isPresent' },

          attendanceRelevant: { $max: '$isAttendanceRelevant' },
        },
      },

      // 5️⃣ Regroupement par thème
      {
        $group: {
          _id: '$_id.theme',

          totalEventsSet: { $addToSet: '$_id.eventId' },

          // ✅ Participants présents (tous statuts confondus sauf Présent)
          totalParticipants: {
            $sum: {
              $cond: [{ $eq: ['$isPresent', 1] }, 1, 0],
            },
          },

          // ✅ Participants uniques présents
          uniqueParticipantsSet: {
            $addToSet: {
              $cond: [
                { $eq: ['$isPresent', 1] },
                '$_id.benevoleId',
                '$$REMOVE',
              ],
            },
          },

          // ✅ Pour le taux de présence (Présent / Présent+Absent)
          attendanceParticipants: {
            $sum: '$attendanceRelevant',
          },

          totalPresences: {
            $sum: {
              $cond: ['$attendanceRelevant', '$isPresent', 0],
            },
          },

          // 👇 Tous les bénévoles inscrits, pour compter plus tard les uniques
          allBenevoleSet: { $addToSet: '$_id.benevoleId' },

          // 👇 Liste pour calcul participants multi-événements
          participationByBenevole: {
            $push: '$_id.benevoleId',
          },
        },
      },
      // 6️⃣ Calculs finaux
      {
        $addFields: {
          totalEvents: { $size: '$totalEventsSet' },
          uniqueParticipants: { $size: '$uniqueParticipantsSet' },

          averageAttendanceRate: {
            $cond: [
              { $eq: ['$attendanceParticipants', 0] },
              0,
              { $divide: ['$totalPresences', '$attendanceParticipants'] },
            ],
          },

          participantsWithMultipleEvents: {
            $size: {
              $filter: {
                input: {
                  $map: {
                    input: { $setUnion: ['$participationByBenevole'] },
                    as: 'benev',
                    in: {
                      $size: {
                        $filter: {
                          input: '$participationByBenevole',
                          as: 'b',
                          cond: { $eq: ['$$b', '$$benev'] },
                        },
                      },
                    },
                  },
                },
                as: 'count',
                cond: { $gte: ['$$count', 2] },
              },
            },
          },

          // ✅ Nouveau champ : bénévoles inscrits uniques (tous statuts)
          totalInscritsUnique: { $size: '$allBenevoleSet' },
        },
      },

      // 7️⃣ Projection finale (DTO)
      {
        $project: {
          _id: 0,
          theme: '$_id',
          totalEvents: 1,
          totalParticipants: 1,
          uniqueParticipants: 1,
          averageAttendanceRate: 1,
          participantsWithMultipleEvents: 1,
          totalInscritsUnique: 1,
        },
      },
    ];

    const stats = await evenementbenev
      .aggregate<EventThemeStatsDto>(pipeline)
      .toArray();

    return stats;
  }
}

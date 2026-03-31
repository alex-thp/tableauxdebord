export interface EventThemeStatsDto {
  theme: string | null; // nom du thème ou null pour global
  totalEvents: number; // nombre total d'événements
  totalParticipants: number; // nombre total de participants présents
  uniqueParticipants: number; // nombre de participants uniques présents
  totalInscritsUnique: number; // nombre total de bénévoles inscrits (tous statuts)
  averageAttendanceRate: number; // taux de présence (Présent / (Présent+Absent), 0 à 1)
  participantsWithMultipleEvents: number; // nombre de participants ayant fait 2+ événements
}

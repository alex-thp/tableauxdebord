import { EventThemeStatsDto } from './event-theme-stats.dto';

export interface EventStatsResponseDto {
  global: EventThemeStatsDto; // stats globales
  byTheme: EventThemeStatsDto[]; // stats par thème
}

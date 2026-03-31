import { EventThemeStatsDto } from 'src/stats_benevole/dto/event-theme-stats.dto';

export class EventStatsResponseDto {
  global: EventThemeStatsDto;
  byTheme: EventThemeStatsDto[];
}

import { Controller, Get } from '@nestjs/common';
import { StatsBenevoleService } from './stats_benevole.service';
import { EventThemeStatsDto } from './dto/event-theme-stats.dto';

@Controller('stats-benevole')
export class StatsBenevoleController {
  constructor(private readonly statsBenevoleService: StatsBenevoleService) {}

  @Get('stats-by-theme')
  async getStatsByTheme(): Promise<EventThemeStatsDto[]> {
    return this.statsBenevoleService.getStatsByTheme();
  }
}

import { Component, OnInit } from '@angular/core';
import { EventThemeStatsDto } from './dto/event-theme-stats.dto';
import { StatsBenevoleService } from './stats-benevole.service';
import { CommonModule } from '@angular/common';
import { BlocEventGroupComponent } from './bloc-event-group/bloc-event-group.component';

interface GroupedStats {
  groupName: string;
  themes: EventThemeStatsDto[];
  selectedTheme: EventThemeStatsDto | null;
}

@Component({
  selector: 'app-stats-benevole',
  standalone: true,
  imports: [CommonModule, BlocEventGroupComponent],
  templateUrl: './stats-benevole.component.html',
  styleUrls: ['./stats-benevole.component.css'],
})
export class StatsBenevoleComponent implements OnInit {
  stats: EventThemeStatsDto[] = [];
  loading = true;
  groupedStats: GroupedStats[] = [];

  constructor(private statsService: StatsBenevoleService) {}

  async ngOnInit() {
    (await this.statsService.getStatsByTheme()).subscribe((res) => {
      this.stats = res;
      this.groupStats();
      this.loading = false;
    });
  }

  private groupStats() {
    const formation = this.stats.filter((s) =>
      s.theme?.toLowerCase().includes('formation'),
    );
    const sensibilisation = this.stats.filter((s) =>
      s.theme?.toLowerCase().includes('sensibilisation'),
    );
    const autres = this.stats.filter(
      (s) =>
        !s.theme?.toLowerCase().includes('formation') &&
        !s.theme?.toLowerCase().includes('sensibilisation'),
    );

    this.groupedStats = [];

    if (formation.length) {
      this.groupedStats.push({
        groupName: 'Formation',
        themes: formation,
        selectedTheme: formation[0],
      });
    }

    if (sensibilisation.length) {
      this.groupedStats.push({
        groupName: 'Sensibilisation',
        themes: sensibilisation,
        selectedTheme: sensibilisation[0],
      });
    }

    if (autres.length) {
      autres.forEach((t) => {
        this.groupedStats.push({
          groupName: t.theme || 'Autres',
          themes: [t],
          selectedTheme: t,
        });
      });
    }
  }
}

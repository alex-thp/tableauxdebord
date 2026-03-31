import { Component, Input } from '@angular/core';
import { StatsBenevoleService } from '../stats-benevole.service';
import { CommonModule } from '@angular/common';
import { EventThemeStatsDto } from '../dto/event-theme-stats.dto';
@Component({
  selector: 'app-bloc-event',
  imports: [CommonModule],
  templateUrl: './bloc-event.component.html',
  styleUrl: './bloc-event.component.css',
})
export class BlocEventComponent {
  @Input() stat: EventThemeStatsDto | null = null;
  constructor() {}

  get averageAttendancePercent(): string {
    // transforme le nombre 0.82 → "82%"
    return `${Math.round((this.stat?.averageAttendanceRate || 0) * 100)}%`;
  }
}

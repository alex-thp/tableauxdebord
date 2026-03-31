import { Component, Input } from '@angular/core';
import { EventThemeStatsDto } from '../dto/event-theme-stats.dto';
import { CommonModule } from '@angular/common';
import { BlocEventComponent } from '../bloc-event/bloc-event.component';

interface GroupedStats {
  groupName: string;
  themes: EventThemeStatsDto[];
  selectedTheme: EventThemeStatsDto | null;
}

@Component({
  selector: 'app-bloc-event-group',
  standalone: true,
  imports: [CommonModule, BlocEventComponent],
  templateUrl: './bloc-event-group.component.html',
  styleUrl: './bloc-event-group.component.css',
})
export class BlocEventGroupComponent {
  @Input() group!: GroupedStats;

  onSelectTheme(event: Event) {
    const selectEl = event.target as HTMLSelectElement; // cast ici
    const themeName = selectEl.value;

    const selected =
      this.group.themes.find((t) => t.theme === themeName) || null;
    this.group.selectedTheme = selected;
  }
}

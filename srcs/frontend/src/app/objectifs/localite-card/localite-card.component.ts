import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-localite-card',
  templateUrl: './localite-card.component.html',
  styleUrls: ['./localite-card.component.css'],
  standalone: true
})
export class LocaliteCardComponent {
  @Input() localite!: string | number;
  @Input() objectifsRealises!: number;
  @Input() objectifs!: number;
  @Input() nextDeadline: string | null = null;

  get progress(): number {
    return this.objectifs === 0 ? 0 : Math.min(100, Math.round((this.objectifsRealises / this.objectifs) * 100));
  }
}

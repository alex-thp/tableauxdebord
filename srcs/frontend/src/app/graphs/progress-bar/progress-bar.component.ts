import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css'],
  standalone: true,
})
export class ProgressBarComponent implements OnChanges {
  @Input() realise!: number;
  @Input() attendu!: number;
  public percentage: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    this.calculatePercentage();
  }

  private calculatePercentage() {
    if (this.attendu <= 0) {
      this.percentage = 0;
      return;
    }

    const rawPercentage = (this.realise / this.attendu) * 100;
    this.percentage = Math.min(Math.max(rawPercentage, 0), 100); // Borné entre 0-100%
  }

  get displayText(): string {
    return `${Math.round(this.percentage)}% (${this.realise}/${this.attendu})`;
  }
}

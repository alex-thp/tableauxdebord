// monthly-comparison.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monthly-comparison',
  templateUrl: './monthly-comparison.component.html',
  styleUrls: ['./monthly-comparison.component.css'],
  imports: [CommonModule],
})
export class MonthlyComparisonComponent {
  @Input() data: { year: number; month: number; count: number }[] = [];

  monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  processedData: any[] = [];
  maxValue = 0;

  ngOnChanges() {
    this.processData();
  }

  private processData() {
    // Group data by month across all years
    const groupedByMonth: { [key: number]: any } = {};

    // Find max value for scaling
    this.maxValue = Math.max(...this.data.map((item) => item.count), 0);

    // Initialize structure
    for (let month = 0; month < 12; month++) {
      groupedByMonth[month + 1] = {
        monthName: this.monthNames[month],
        years: {},
      };
    }

    // Populate with data
    this.data.forEach((item) => {
      groupedByMonth[item.month].years[item.year] = item.count;
    });

    // Convert to array
    this.processedData = Object.values(groupedByMonth);
  }

  getAvailableYears(yearsData: any): number[] {
    return Object.keys(yearsData)
      .map((year) => parseInt(year))
      .sort((a, b) => a - b); // Tri par ordre croissant
  }

  getBarHeight(count: number): string {
    if (!count || this.maxValue === 0) return '0%';
    return `${(count / this.maxValue) * 100}%`;
  }
}

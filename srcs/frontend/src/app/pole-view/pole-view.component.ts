import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GatewayService } from '../gateway.service';
import { ViewData } from '../models/view.model';
import { CommonModule } from '@angular/common';
import * as featherIcons from '@ng-icons/feather-icons';
import { ProgressBarComponent } from '../graphs/progress-bar/progress-bar.component';
import { PieChartComponent } from '../graphs/pie-chart/pie-chart.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { DateSearchComponent } from '../date-search/date-search.component';
import { MonthlyComparisonComponent } from '../graphs/monthly-comparison/monthly-comparison.component';


@Component({
  selector: 'app-pole-view',
  imports: [CommonModule, ProgressBarComponent, PieChartComponent, NgIcon, DateSearchComponent, MonthlyComparisonComponent],
  templateUrl: './pole-view.component.html',
  styleUrl: './pole-view.component.css',
  viewProviders: [provideIcons(featherIcons)],
  standalone: true,
})
export class PoleViewComponent implements OnInit, OnChanges {

  data!: ViewData;
  i!: string | null;
  labels?: any;
  values?: any;
  colors?: any;
  labels_two?: any;
  values_two?: any;
  colors_two?: any;
  currentYear = new Date().getFullYear();
  date_debut: string = this.formatDate(new Date(this.currentYear, 0, 1));
  date_fin: string = this.formatDate(new Date(this.currentYear, 11, 31));
;

  constructor(
    private route: ActivatedRoute, 
    private gatewayService: GatewayService,
    private cdr: ChangeDetectorRef, 
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      console.log('Data mise à jour dans CardComponent:', this.data);
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  generateColors(n: number): string[] {
    const colors = [];
    for (let i = 0; i < n; i++) {
      const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      colors.push(color);
    }
    return colors;
  }

  ngOnInit() {
    this.i = this.route.snapshot.paramMap.get('i');
    console.log(this.i)
    this.gatewayService.getViewData(Number(this.i), new Date(this.date_debut), new Date(this.date_fin)).subscribe({
      next: (response) => {
        console.log('Données reçues (requête HTTP) :', response);
        this.data = response;
        console.log(this.data.array_one);
        console.log('Data mise à jour:', this.data);
        if (this.data.array_one !== undefined && Array.isArray(this.data.array_one)) {
          this.labels = this.data.array_one.map((item: { type: string }) => item.type);
          this.values = this.data.array_one.map((item: { count: number }) => item.count);
          this.colors = this.generateColors(this.data.array_one.length);
        }
        if (this.data.array_two !== undefined && Array.isArray(this.data.array_two)) {
          this.labels_two = this.data.array_two.map((item: { type: string }) => item.type);
          this.values_two = this.data.array_two.map((item: { count: number }) => item.count);
          this.colors_two = this.generateColors(this.data.array_two.length);
        }
  
        // Force Angular à détecter les changements après la mise à jour de `data`
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors de la requête HTTP:', error);
      }
    });
  }

  toggleBack(): void {
    console.log(this.i)
    this.router.navigate(['/home']).then(nav => {
    }, err => {
      console.log(err)
    });
  }

  handleDates(dates: { start: string, end: string }): void {
    this.date_debut = dates.start;
    this.date_fin = dates.end;

    this.refreshData();
  }
  private refreshData(): void {
    const startDate = this.date_debut ? new Date(this.date_debut) : new Date(this.currentYear, 0, 1);
    const endDate = this.date_fin ? new Date(this.date_fin) : new Date(this.currentYear, 11, 31);
    this.data.label = "";
    this.ngOnInit();
  }
}

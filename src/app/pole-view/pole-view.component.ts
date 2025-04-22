import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GatewayService } from '../gateway.service';
import { ViewData } from '../models/view.model';
import { CommonModule } from '@angular/common';
import * as featherIcons from '@ng-icons/feather-icons';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { PieChartComponent } from '../pie-chart/pie-chart.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { DateSearchComponent } from '../date-search/date-search.component';
import { ReactiveFormsModule } from '@angular/forms'


@Component({
  selector: 'app-pole-view',
  imports: [CommonModule, ProgressBarComponent, PieChartComponent, NgIcon, DateSearchComponent, ReactiveFormsModule],
  templateUrl: './pole-view.component.html',
  styleUrl: './pole-view.component.css',
  viewProviders: [provideIcons(featherIcons)],
})
export class PoleViewComponent implements OnInit, OnChanges {

  data!: ViewData;
  i!: string | null;
  labels?: any;
  values?: any;
  colors?: any;

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
    this.gatewayService.getViewData(Number(this.i)).subscribe({
      next: (response) => {
        console.log('Données reçues (requête HTTP) :', response);
        this.data = response;
        console.log('Data mise à jour:', this.data);
        if (this.data.array_one !== undefined) {
          this.labels = this.data.array_one.map((item: { type: any; }) => item.type);
          this.values = this.data.array_one.map((item: { count: any; }) => item.count);
          this.colors = this.generateColors(this.data.array_one.length);
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
      console.log(nav); // true if navigation is successful
    }, err => {
      console.log(err) // when there's an error
    });
  }

}

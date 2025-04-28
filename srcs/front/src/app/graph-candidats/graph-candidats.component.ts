import { Component, ViewChild, ElementRef, AfterViewInit, OnInit, Input, Inject, PLATFORM_ID } from '@angular/core';
import { GatewayService } from '../gateway.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-graph-candidats',
  templateUrl: './graph-candidats.component.html',
  styleUrls: ['./graph-candidats.component.css']
})
export class GraphCandidatsComponent implements AfterViewInit, OnInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef;
  
  @Input() data: any;
  isBrowser: boolean;
  labels: string[] = [];
  date_debut: Date | null = null;
  date_fin: Date | null = null;

  constructor(private gatewayService: GatewayService, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return; // Évite d'exécuter du code côté serveur

    this.gatewayService.getViewData(1, this.date_debut, this.date_fin).subscribe({
      next: (response) => {
        this.data = [
          response.nb_homme_cdp, 
          response.nb_femmes_cdp, 
          response.nb_moins_30_cdp, 
          response.nb_plus_60_cdp, 
          response.nb_epa_cdp, 
          response.nb_ppsmj_cdp
        ]; 
        this.labels = ['Nb Hommes', 'Nb Femmes', '< 30 ans', '> 60 ans', 'EPA', 'PPSMJ'];

        // Une fois les données chargées, on dessine le graphique
        this.drawChart();
      },
      error: (error) => {
        console.error('Erreur lors de la requête HTTP:', error);
      }
    });
  }

  ngAfterViewInit() {
    // On ne dessine le graphique que si les données sont déjà disponibles
    if (this.data && this.isBrowser) {
      this.drawChart();
    }
  }

  drawChart() {
    if (!this.isBrowser || !this.data || !this.chartCanvas) return;
  
    const canvas: HTMLCanvasElement = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const values = this.data;
    const labels = this.labels;
  
    const maxData = Math.max(...values);
    const barWidth = 50;
    const gap = 20;
    const startX = 50;
  
    values.forEach((value: number, index: number) => {
      const barHeight = (value / maxData) * 200;
  
      ctx.fillStyle = 'blue';
      ctx.fillRect(
        startX + index * (barWidth + gap),
        canvas.height - barHeight - 20,
        barWidth,
        barHeight
      );
  
      ctx.fillStyle = 'black';
      ctx.fillText(
        labels[index],
        startX + index * (barWidth + gap) + 10,
        canvas.height - 5
      );
    });
  }
}

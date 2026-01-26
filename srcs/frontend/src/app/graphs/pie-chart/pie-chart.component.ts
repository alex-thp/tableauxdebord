import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css'],
  imports: [CommonModule],
  standalone: true,
})
export class PieChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: number[] = [30, 50, 20];
  @Input() labels: string[] = ['A', 'B', 'C'];
  @Input() colors: string[] = ['#FF6384', '#36A2EB', '#FFCE56'];

  private ctx!: CanvasRenderingContext2D;
  constructor(private cdr: ChangeDetectorRef) {}
  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.drawChart();
  }

  ngOnChanges() {
    if (this.ctx) this.drawChart();
  }

  getCanvasSize(): number {
    const container = this.canvas.nativeElement.parentElement;
    return Math.min(container?.clientWidth || 300, 400) - 20; // Marge de sécurité
  }

  private getContrastColor(hexColor: string): string {
    // Convertir la couleur en luminance
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  private drawChart() {
    if (!this.data || this.data.length === 0) return; // <- Ajout ici

    const total = this.data.reduce((a, b) => a + b, 0);
    let startAngle = Math.PI / 2;
    const radius =
      Math.min(
        this.canvas.nativeElement.width,
        this.canvas.nativeElement.height
      ) / 2;
    this.canvas.nativeElement.width = this.getCanvasSize();
    this.canvas.nativeElement.height = this.getCanvasSize();
    this.ctx.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    let remainingAngle = 2 * Math.PI;

    // Dessiner chaque portion
    this.data.forEach((value, i) => {
      const isLast = i === this.data.length - 1;
      const sliceAngle = isLast
        ? remainingAngle // Utiliser l'angle restant pour la dernière portion
        : (2 * Math.PI * value) / total;

      this.ctx.beginPath();
      this.ctx.fillStyle = this.colors[i];
      this.ctx.moveTo(radius, radius);
      this.ctx.arc(radius, radius, radius, startAngle, startAngle + sliceAngle);
      this.ctx.closePath();
      this.ctx.fill();
      if (value > 0) {
        const percent = ((value / total) * 100).toFixed(1);
        const midAngle = startAngle + sliceAngle / 2;

        // Position du texte
        const textX = radius + Math.cos(midAngle) * (radius * 0.6);
        const textY = radius + Math.sin(midAngle) * (radius * 0.6);

        // Style du texte
        this.ctx.fillStyle = this.getContrastColor(this.colors[i]);
        this.ctx.font = `${radius * 0.15}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.ctx.fillText(`${percent}%`, textX, textY);
      }

      startAngle += sliceAngle;
      remainingAngle -= sliceAngle;
    });
    this.cdr.detectChanges();
  }
}

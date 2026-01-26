import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnChanges,
  AfterViewInit,
} from '@angular/core';

@Component({
  selector: 'app-scatter-plot',
  template: `<canvas #chartCanvas width="800" height="400"></canvas>`,
  styles: [':host { display:block; }'],
})
export class ScatterPlotComponent implements OnChanges, AfterViewInit {
  @Input() datasetA: { year: number; month: number; count: number }[] = [];
  @Input() datasetB: { year: number; month: number; count: number }[] = [];

  @ViewChild('chartCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.draw();
  }

  ngOnChanges() {
    if (this.ctx) this.draw();
  }

  private draw() {
    const ctx = this.ctx;
    const canvas = this.canvasRef.nativeElement;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const margin = 50;
    const legendWidth = 120;
    const w = canvas.width - margin * 2 - legendWidth;
    const h = canvas.height - margin * 2;

    const all = [...this.datasetA, ...this.datasetB];
    if (all.length === 0) return;

    const maxY = Math.max(...all.map((d) => d.count));
    const minY = 0;
    const minX = 1;
    const maxX = 12;

    const xScale = (month: number) =>
      margin + ((month - minX) / (maxX - minX)) * w;
    const yScale = (val: number) =>
      canvas.height - margin - ((val - minY) / (maxY - minY)) * h;

    // Axes
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, canvas.height - margin);
    ctx.lineTo(canvas.width - margin - legendWidth, canvas.height - margin);
    ctx.stroke();

    // Mois sur l’axe X
    const mois = [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let m = 1; m <= 12; m++) {
      const x = xScale(m);
      ctx.fillText(mois[m - 1], x, canvas.height - margin + 5);
    }

    // Graduation Y
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const step = Math.ceil(maxY / 5) || 1;
    for (let val = 0; val <= maxY; val += step) {
      const y = yScale(val);
      ctx.fillText(String(val), margin - 5, y);
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(canvas.width - margin - legendWidth, y);
      ctx.strokeStyle = '#eee';
      ctx.stroke();
    }

    // --- Gestion des années et couleurs ---
    const years = Array.from(new Set(all.map((d) => d.year))).sort();
    const palette = [
      '#1f77b4',
      '#ff7f0e',
      '#2ca02c',
      '#d62728',
      '#9467bd',
      '#8c564b',
      '#e377c2',
      '#7f7f7f',
      '#bcbd22',
      '#17becf',
    ];
    const colorForYear: Record<number, string> = {};
    years.forEach((y, i) => {
      colorForYear[y] = palette[i % palette.length];
    });

    // Points colorés par année
    all.forEach((d) => {
      ctx.fillStyle = colorForYear[d.year];
      const x = xScale(d.month);
      const y = yScale(d.count);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // --- LÉGENDE : une entrée par année ---
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '14px Arial';

    const legendX = canvas.width - legendWidth + 20;
    let legendY = margin;
    ctx.fillStyle = '#000';
    ctx.fillText('Années', legendX, legendY);
    legendY += 20;

    years.forEach((y) => {
      ctx.fillStyle = colorForYear[y];
      ctx.fillRect(legendX, legendY - 6, 12, 12);
      ctx.fillStyle = '#000';
      ctx.fillText(String(y), legendX + 20, legendY);
      legendY += 20;
    });
  }
}

import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-date-search',
  standalone: true,
  imports: [
    CommonModule, // Nécessaire pour *ngIf
    FormsModule // Nécessaire pour ngForm et ngModel
  ],
  templateUrl: './date-search.component.html',
  styleUrls: ['./date-search.component.css']
})
export class DateSearchComponent implements OnInit {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  errorMessage: string | null = null;

  @Output() datesSubmitted = new EventEmitter<{ start: string, end: string }>();

  ngOnInit() {
    if (!this.startDate || !this.endDate) {
      const defaultDates = this.getDefaultDates();
      this.startDate = this.startDate || defaultDates.start;
      this.endDate = this.endDate || defaultDates.end;
    }
  }

  private getDefaultDates(): { start: string, end: string } {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return {
      start: this.formatDate(start),
      end: this.formatDate(end)
    };
  }

  private getDefaultEndDate(): string {
    return this.formatDate(new Date()); // Aujourd'hui
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  validateDates(): void {
    if (!this.startDate || !this.endDate) {
      this.errorMessage = 'Les deux dates sont requises';
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    if (start > end) {
      this.errorMessage = 'La date de fin doit être postérieure à la date de début';
    } else {
      this.errorMessage = null;
    }
  }

  onSubmit(): void {
    if (this.errorMessage) return;

    this.datesSubmitted.emit({
      start: this.startDate ?? null,
      end: this.endDate ?? null
    });

    // Réinitialisation du formulaire
    this.errorMessage = null;
  }
}
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'stringDateFormat'
})
export class StringDateFormatPipe implements PipeTransform {

  private datePipe = new DatePipe('fr-FR');

  transform(value: string | null | undefined, format = 'dd/MM/yyyy'): string | null {
    if (!value) return null;

    const date = new Date(value);
    // Vérifie que la date est valide
    if (isNaN(date.getTime())) return value; // retourne la valeur d'origine si invalide

    return this.datePipe.transform(date, format);
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByDateFin',
  pure: true
})
export class SortByDateFinPipe implements PipeTransform {
  transform(values: any[]): any[] {
    if (!Array.isArray(values)) return values;

    return [...values].sort((a, b) => {
          console.log('val.date_fin:', a.date_fin, b.date_fin);
      const dateA = new Date(a.date_fin).getTime();
      const dateB = new Date(b.date_fin).getTime();
      return dateA - dateB;
    });
  }
}
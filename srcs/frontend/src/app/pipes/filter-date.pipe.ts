import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterDate' })
export class FilterDatePipe implements PipeTransform {
  transform(values: any[], dateDebutStr: string, dateFinStr: string): any[] {
    if (!values) return [];

    const dateDebut = dateDebutStr ? new Date(dateDebutStr) : null;
    const dateFin = dateFinStr ? new Date(dateFinStr) : null;

    return values.filter(val => {
      const dDebut = new Date(val.date_debut);
      const dFin = new Date(val.date_fin);

      const passeDebut = dateDebut ? dFin >= dateDebut : true;
      const passeFin = dateFin ? dDebut <= dateFin : true;

      return passeDebut && passeFin;
    });
  }
}
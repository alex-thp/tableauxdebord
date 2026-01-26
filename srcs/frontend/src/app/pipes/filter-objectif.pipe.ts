import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterObjectif' })
export class FilterObjectifPipe implements PipeTransform {
  transform(
    values: any[],
    filtreRealise: boolean,
    filtreNonRealise: boolean
  ): any[] {
    if (!values) return [];
    return values.filter((val) => {
      const estRealise = val.realise >= val.objectif;
      return (filtreRealise && estRealise) || (filtreNonRealise && !estRealise);
    });
  }
}

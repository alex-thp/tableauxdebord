import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterMulti',
})
export class FilterMultiPipe implements PipeTransform {
  transform(
    data: any[],
    localites: string[],
    sujets: string[],
    actions: string[]
  ): any[] {
    return data.filter(
      (loc) =>
        (localites.length === 0 || localites.includes(loc.label)) &&
        loc.next?.some(
          (sujetLoc: { label: string; next: any[] }) =>
            (sujets.length === 0 || sujets.includes(sujetLoc.label)) &&
            sujetLoc.next?.some(
              (action) => actions.length === 0 || actions.includes(action.label)
            )
        )
    );
  }
}

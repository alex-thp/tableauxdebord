import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByLabel',
  standalone: true,
})
export class FilterByLabelPipe implements PipeTransform {
  transform(items: any[], label: string): any[] {
    if (!label) return items;
    return items.filter((item) => item.label === label);
  }
}

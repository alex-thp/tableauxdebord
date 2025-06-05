import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DevGatewayService } from '../dev-gateway.service';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import * as featherIcons from '@ng-icons/feather-icons';

@Component({
  selector: 'app-main-dev-view',
  imports: [CommonModule, NgIcon],
  templateUrl: './main-dev-view.component.html',
  styleUrls: ['./main-dev-view.component.css'],
  viewProviders: [provideIcons(featherIcons)],
})
export class MainDevViewComponent {

  dataToDisplay: any[] = [];
  columns: string[] = [];
  filteredData: any[] = [];
  activeFilters: { [key: string]: any[] } = {};
  filterDropdownOpenFor: string | null = null;
  visibleColumns: { [key: string]: boolean } = {};
  Object = Object;
  Array = Array;

  constructor(private devGatewayService: DevGatewayService, private router: Router) {}

  ngOnInit() {
    this.searchData();
  }

    toggleBack(): void {
    this.router.navigate(['/home']).then(nav => {
    }, err => {
      console.log(err)
    });
  }

  searchData() {
    this.devGatewayService.getIndicateurValue(
      'Accompagnement - CDP Fixe',
      ["N'importe quel département de la région"],
      'Candidat',
      'Tous profil',
      ["N'importe quel département de la région"],
      'Nb Présent',
      new Date(2025, 0, 1),
      new Date(2025, 11, 31)
    ).subscribe(data2 => {
      this.dataToDisplay = data2 || [];
      this.columns = this.dataToDisplay.length > 0 ? Object.keys(this.dataToDisplay[0]) : [];
      this.filteredData = [...this.dataToDisplay];
      this.visibleColumns = {};
      this.columns.forEach(col => this.visibleColumns[col] = true);
    });
  }

  resetColumnVisibility() {
    this.columns.forEach(col => this.visibleColumns[col] = true);
  }

  toggleColumnVisibility(col: string) {
    this.visibleColumns[col] = !this.visibleColumns[col];
    this.filterDropdownOpenFor = null; // Ferme le menu après clic
  }
  formatValue(value: any): string {
    if (Array.isArray(value)) return value.join(', ');
    if (value instanceof Date) return value.toLocaleDateString();
    return value !== null && value !== undefined ? value.toString() : '';
  }

applyFilter(column: string, value: any) {
  if (!this.activeFilters[column]) {
    this.activeFilters[column] = [value];
  } else {
    const index = this.activeFilters[column].indexOf(value);
    if (index > -1) {
      this.activeFilters[column].splice(index, 1);
      if (this.activeFilters[column].length === 0) {
        delete this.activeFilters[column];
      }
    } else {
      this.activeFilters[column].push(value);
    }
  }
    this.filterData();
  }

  filterData() {
    this.filteredData = this.dataToDisplay.filter(row => {
      return Object.entries(this.activeFilters).every(([key, values]) =>
        values.includes(this.formatValue(row[key]))
      );
    });
  }
  clearFilter(column: string) {
    delete this.activeFilters[column];
      this.filterData();
  }

  toggleFilterDropdown(column: string | null) {
  this.filterDropdownOpenFor = this.filterDropdownOpenFor === column ? null : column;
}

getUniqueValuesForColumn(column: string): any[] {
  const values = this.dataToDisplay.map(row => this.formatValue(row[column]));
  return Array.from(new Set(values));
}
}

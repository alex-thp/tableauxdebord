import { Component } from '@angular/core';
import { DevGatewayService } from '../dev-gateway.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import * as featherIcons from '@ng-icons/feather-icons';

@Component({
  selector: 'app-visualisation',
  standalone: true,
  imports: [CommonModule, NgIcon],
  templateUrl: './visualisation.component.html',
  styleUrl: './visualisation.component.css',
  viewProviders: [provideIcons(featherIcons)],
})
export class VisualisationComponent {
  dataToSearch: any = {
    "indicateur": "Accompagnement - CDP Fixe",
    "departement": ["N'importe quel département de la région"],
    "profil": "Candidat",
    "type": "Tous profil",
    "dateDebut": new Date(2025, 0, 1),
    "dateFin": new Date(2025, 11, 31),
    "valeur": "Nb Présent"
  };
  dataToDisplay: any[] = [];
  columns: string[] = [];
  filteredData: any[] = [];
  activeFilters: { [key: string]: any[] } = {};
  filterDropdownOpenFor: string | null = null;
  visibleColumns: { [key: string]: boolean } = {};
  Object = Object;
  Array = Array;
  rapportXIndicateurId: string = "";

  constructor(
    private devGatewayService: DevGatewayService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.paramMap.subscribe(params => {
      this.rapportXIndicateurId = params.get('rapport_x_indicateur') || '';
      console.log('Récupération de l\'ID du rapport X Indicateur:', this.rapportXIndicateurId);
      this.devGatewayService.getRapportXIndicateur(this.rapportXIndicateurId)
        .subscribe(data => {
          this.dataToSearch = data || this.dataToSearch;
          this.searchData();
      });
    }); 
  }

  ngOnInit() {
  }

searchData() {
  console.log('Recherche avec les paramètres:', this.dataToSearch);
    this.devGatewayService.getIndicateurValue(
                              this.dataToSearch.action,
                              this.dataToSearch.action_localite,
                              this.dataToSearch.sujet,
                              this.dataToSearch.sujet_critere,
                              this.dataToSearch.sujet_localite,
                              this.dataToSearch.sujet_indicateur,
                              this.dataToSearch.date_debut,
                              this.dataToSearch.date_fin
                            ).subscribe(data2 => {
      this.dataToDisplay = data2 || [];
      this.columns = this.dataToDisplay.length > 0 ? Object.keys(this.dataToDisplay[0]) : [];
      this.filteredData = [...this.dataToDisplay];
      this.visibleColumns = {};
      this.columns.forEach(col => this.visibleColumns[col] = true);
    });
  }


  searchData2() {
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
    this.filterDropdownOpenFor = null;
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

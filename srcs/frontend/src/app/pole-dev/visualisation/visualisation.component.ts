import { Component } from '@angular/core';
import { DevGatewayService } from '../dev-gateway.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import * as featherIcons from '@ng-icons/feather-icons';

@Component({
  selector: 'app-visualisation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualisation.component.html',
  styleUrl: './visualisation.component.css',
  viewProviders: [provideIcons(featherIcons)],
})
export class VisualisationComponent {
  dataToSearch: any = {
    indicateur: "",
    departement: [],
    profil: "",
    type: "",
    dateDebut: new Date(2025, 0, 1),
    dateFin: new Date(2025, 11, 31),
    valeur: ""
  };
  ready = false;
  dataToDisplay: any[] = [];
  columns: string[] = [];
  filteredData: any[] = [];
  activeFilters: { [key: string]: any[] } = {};
  filterDropdownOpenFor: string | null = null;
  visibleColumns: { [key: string]: boolean } = {};
  Object = Object;
  Array = Array;
  rapportXIndicateurId: string = "";
  notFound: boolean = false;
  dateFilters: { [key: string]: { before?: Date; after?: Date } } = {};
  numericFilters: { [key: string]: { greaterThan?: number; lessThan?: number } } = {};
  textFilters: { [key: string]: { id: string; value: string }[] } = {};

  private nextTextFilterId = 1;
  
  constructor(
    private devGatewayService: DevGatewayService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.paramMap.subscribe(params => {
      this.rapportXIndicateurId = params.get('rapport_x_indicateur') || '';
      console.log("Récupération de l'ID du rapport X Indicateur:", this.rapportXIndicateurId);
      this.devGatewayService.getRapportXIndicateur(this.rapportXIndicateurId)
        .subscribe({
          next: data => {
            console.log("Données du rapport X Indicateur:", data);

            if (data?.message) {
              this.router.navigate(['/not_found']);
            } else {
              this.dataToSearch = data || this.dataToSearch;
              this.searchData();
            }
          },
          error: err => {
            console.error("Erreur lors de la récupération du rapport:", err);

            if (err.status === 401) {
              alert("Session expirée ou non authentifié. Veuillez vous reconnecter.");
              this.router.navigate(['/login']);
            } else if (err.status === 404) {
              alert("Rapport non trouvé. Veuillez vérifier l'ID du rapport.");
              this.router.navigate(['/not_found']);
            } else {
              // Autres erreurs (500, etc.)
              // afficher une alerte ou une page d’erreur générique
            }
          }
        });
    });
  }

  ngOnInit() {}

  searchData() {
  console.log('Recherche avec les paramètres:', this.dataToSearch);
  this.devGatewayService.getVisualisationValue(
    this.dataToSearch.action,
    this.dataToSearch.action_localite,
    this.dataToSearch.sujet,
    this.dataToSearch.sujet_critere,
    this.dataToSearch.sujet_localite,
    this.dataToSearch.sujet_indicateur,
    this.dataToSearch.date_debut,
    this.dataToSearch.date_fin,
    this.dataToSearch.structure_beneficiaire,
  ).subscribe({
    next: (data2) => {
      const parsedData = (data2 || []).map((row: { [x: string]: any; }) => {
        const newRow: any = {};
        for (const key in row) {
          const value = row[key];
          //console.log(`Clé: ${key}, Valeur:`, value);
          if (key === "candidat") {
            const nom = value.nom || '';
            const prenom = value.prenom || '';
            newRow["nom"] = nom;
            newRow["prenom"] = prenom;
          }
          else if (
            key === "_id" 
            || key === "record_id" 
            || key === "cdp_enr_cand_x_cdp_enr_benev_record_id" 
            || key === "prescripteur_record_id" 
            || key === "candidat_record_id" 
            || key === "date_creation" 
            || key === "bien_etre_enr_cand_record_id" 
            || key === "at_co_enr_cand_record_id" 
            || key === "__v" 
            || key === "suiviDetails" 
            || key === "candidatDetails" 
            || value === null 
            || value === undefined 
            || value === ''
            || value === "cdpenrcand"
            || value === "cdpDetails"
          ) {
            // Ignore les champs _id, record_id et les clés vides
            continue;
          }
          else if (typeof value === 'number' && !Number.isInteger(value)) {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
            newRow[label] = value;
          // C'est un float
          }
          // Vérifie si la valeur est une string de date ISO
          else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([+-]\d{2}:\d{2}))?$/.test(value)) {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
            newRow[label] = new Date(value);
          } else {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()).replace("Candidat", '').replace("Cdp X Benev", 'Ateliers').replace("Benev", '');
            newRow[label] = value;
          }
        }
        return newRow;
      });

      this.dataToDisplay = parsedData;
      this.notFound = this.dataToDisplay.length === 0;
      this.columns = this.dataToDisplay.length > 0 ? Object.keys(this.dataToDisplay[0]) : [];
      this.filteredData = [...this.dataToDisplay];
      this.visibleColumns = {};
      this.columns.forEach(col => this.visibleColumns[col] = true);
    },
    error: (err) => {
      console.error('Erreur lors de la récupération des données :', err);
      if (err.status === 403) {
        alert("Accès interdit. Veuillez vérifier vos droits ou votre authentification.");
      } else if (err.status === 401) {
        alert("Session expirée ou non authentifié. Veuillez vous reconnecter.");
        this.router.navigate(['/login']);
      }
    },
    complete: () => {
      this.ready = true;
    }
  });
}
    private makeTextFilterItem(value = '') {
    return { id: `tf_${this.nextTextFilterId++}`, value };
  }

  toggleFilterDropdown(column: string | null) {
  if (this.filterDropdownOpenFor === column) {
    this.closeFilterDropdown();
  } else {
    this.filterDropdownOpenFor = column;

    // Si la colonne est textuelle, initialiser au besoin
    if (column && !this.isNumericColumn(column) && !this.isDateColumn(column)) {
      this.initTextFilter(column);
    }

    document.addEventListener('click', this.handleOutsideClick, true);
  }
}

  closeFilterDropdown() {
    this.filterDropdownOpenFor = null;
    document.removeEventListener('click', this.handleOutsideClick, true);
  }

  handleOutsideClick = (event: MouseEvent) => {
    // Vérifier si le clic est en dehors du dropdown et du bouton d'ouverture

    // Trouve l'élément cliqué
    const target = event.target as HTMLElement;

    // Trouve le dropdown DOM (supposons class="filter-dropdown")
    const dropdown = document.querySelector('.filter-dropdown');

    // Trouve tous les boutons qui peuvent ouvrir un dropdown (ex: header-label)
    const toggles = document.querySelectorAll('.header-label');

    if (
      dropdown && !dropdown.contains(target) &&
      !Array.from(toggles).some(toggle => toggle.contains(target))
    ) {
      this.closeFilterDropdown();
    }
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
    if (typeof value === 'number') {
      return Number.isInteger(value) ? value.toString() : value.toFixed(0);
    }
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
    const matchFilters = Object.entries(this.activeFilters).every(([key, values]) =>
      values.includes(this.formatValue(row[key]))
    );

    const matchDateFilters = Object.entries(this.dateFilters).every(([key, { before, after }]) => {
      const rowDate = new Date(row[key]);
      if (before && rowDate > before) return false;
      if (after && rowDate < after) return false;
      return true;
    });

    const matchNumericFilters = Object.entries(this.numericFilters).every(([key, { greaterThan, lessThan }]) => {
      const value = row[key];
      if (typeof value !== 'number') return true;
      if (greaterThan !== undefined && value <= greaterThan) return false;
      if (lessThan !== undefined && value >= lessThan) return false;
      return true;
    });

    const matchTextFilters = Object.entries(this.textFilters || {}).every(([key, items]) => {
  const filledValues = items.map(i => i.value).filter(v => v.trim() !== '');
  if (filledValues.length === 0) return true;
  const cellValue = (row[key] ?? '').toString().toLowerCase();
  return filledValues.some(v => cellValue.includes(v.toLowerCase().trim()));
});

    return matchFilters && matchDateFilters && matchNumericFilters && matchTextFilters;
  });
}

isNumericColumn(column: string): boolean {
  return this.dataToDisplay.some(row => typeof row[column] === 'number');
}

onFilterDropdownFocusOut(event: FocusEvent) {
  // On attend un peu que le focus soit mis à jour
  setTimeout(() => {
    const active = document.activeElement;
    const dropdown = event.currentTarget as HTMLElement;

    // Si le focus n'est plus dans le dropdown, on ferme
    if (!dropdown.contains(active)) {
      this.filterDropdownOpenFor = null;
    }
  }, 0);
}

  isDateColumn(column: string): boolean {
    return this.dataToDisplay.some(row => {
      const value = row[column];
      return value instanceof Date;
      //return value && !Array.isArray(value) && !isNaN(Date.parse(value));
    });
  }

  onDateFilterChange(event: Event, column: string, type: 'before' | 'after') {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.setDateFilter(column, value, type);
  }

  setDateFilter(column: string, value: string, type: 'before' | 'after') {
    if (!this.dateFilters[column]) this.dateFilters[column] = {};
    this.dateFilters[column][type] = value ? new Date(value) : undefined;

    if (!this.dateFilters[column].before && !this.dateFilters[column].after) {
      delete this.dateFilters[column];
    }

    this.filterData();
  }

  clearDateFilter(col: string) {
    delete this.dateFilters[col];
    this.filterData();
  }

  onNumericFilterChange(event: Event, column: string, type: 'greaterThan' | 'lessThan') {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  this.setNumericFilter(column, value, type);
}

setNumericFilter(column: string, value: string, type: 'greaterThan' | 'lessThan') {
  if (!this.numericFilters[column]) this.numericFilters[column] = {};
  this.numericFilters[column][type] = value ? parseFloat(value) : undefined;

  // Si aucun des deux filtres n’est défini, on supprime la clé
  if (!this.numericFilters[column].greaterThan && !this.numericFilters[column].lessThan) {
    delete this.numericFilters[column];
  }

  this.filterData();
}

clearNumericFilter(column: string) {
  delete this.numericFilters[column];
  this.filterData();
}


  clearFilter(column: string) {
    delete this.activeFilters[column];
    this.filterData();
  }

  // initialiser un premier champ (appelé par toggleFilterDropdown)
  initTextFilter(column: string) {
  if (!this.textFilters[column]) {
    this.textFilters[column] = [ this.makeTextFilterItem() ];
  }
}

onTextFilterChange(event: Event, column: string, index: number) {
  const input = event.target as HTMLInputElement;
  const value = input.value; // ne trim pas automatiquement : laisse utilisateur taper des espaces si besoin

  // Met à jour la valeur *sur l'objet existant* (ne recrée pas l'objet)
  const items = this.textFilters[column];
  if (!items) return;
  items[index].value = value;

  // Si le dernier champ n'est plus vide, on ajoute un nouveau champ vide (push)
  const last = items[items.length - 1];
  if (last.value !== '') {
    items.push(this.makeTextFilterItem(''));
  }

  // Supprimer les doublons vides consécutifs à la fin (ne supprime pas le focus si on ne recrée pas)
  while (items.length > 1 && items.at(-1)?.value === '' && items.at(-2)?.value === '') {
    items.pop();
  }

  // Si tous les champs sont vides -> supprimer complètement le filtre
  const allEmpty = items.every(it => it.value.trim() === '');
  if (allEmpty) {
    delete this.textFilters[column];
  }

  this.filterData();
}

clearTextFilter(column: string) {
  delete this.textFilters[column];
  this.filterData();
}

// trackBy pour le ngFor
trackByTextFilter(_index: number, item: { id: string; value: string }) {
  return item.id;
}

  getUniqueValuesForColumn(column: string): any[] {
    const rawValues = this.dataToDisplay.map(row => row[column]);

    // Déterminer le type dominant des valeurs non nulles/undefined
    const nonNullValues = rawValues.filter(v => v !== null && v !== undefined);
    const sample = nonNullValues[0];

    let sortedValues: any[] = [];

    if (sample instanceof Date) {
      sortedValues = [...new Set(nonNullValues.map(v => (v instanceof Date ? v : new Date(v))))];
      sortedValues.sort((a, b) => a.getTime() - b.getTime());
    } else if (typeof sample === 'number') {
      sortedValues = [...new Set(nonNullValues)];
      sortedValues.sort((a, b) => a - b);
    } else {
      sortedValues = [...new Set(nonNullValues.map(v => v.toString()))];
      sortedValues.sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    }

    return sortedValues;
  }
}

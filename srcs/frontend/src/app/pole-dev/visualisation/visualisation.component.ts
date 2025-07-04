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
              // Optionnel : afficher une alerte ou une page d’erreur générique
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
          // Vérifie si la valeur est une string de date ISO
          else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([+-]\d{2}:\d{2}))?$/.test(value)) {
            newRow[key] = new Date(value);
          } else {
            newRow[key] = value;
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

  toggleFilterDropdown(column: string | null) {
    if (this.filterDropdownOpenFor === column) {
      this.closeFilterDropdown();
    } else {
      this.filterDropdownOpenFor = column;
      // Ici on active l'écoute globale pour clics extérieurs
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

      return matchFilters && matchDateFilters;
    });
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

  clearFilter(column: string) {
    delete this.activeFilters[column];
    this.filterData();
  }

  getUniqueValuesForColumn(column: string): any[] {
    const values = this.dataToDisplay.map(row => this.formatValue(row[column]));
    return Array.from(new Set(values));
  }
}

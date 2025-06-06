import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DevGatewayService } from '../dev-gateway.service';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import * as featherIcons from '@ng-icons/feather-icons';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-dev-view',
  imports: [CommonModule, ReactiveFormsModule, NgIcon],
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
  formulaire: FormGroup;
  criteresOptions: string[] = [
    'EPA', 
    'RSA', 
    'Femmes', 
    'Hommes'
  ];
  localitesOptions = [
    '75', 
    '77', 
    '91', 
    '93', 
    '94', 
    '95'
  ];
  actionOptions = [
    'Accompagnement - CDP Fixe', 
    'Accompagnement - CDP Mobile', 
    'Accompagnement - CDP Fixe ou Mobile', 
    'Accompagnement - Atelier Collectif'
  ];
  sujetOptions = ['Candidat'];
  sujetIndicateurOptions = ['Nb Présents'];

  constructor(private devGatewayService: DevGatewayService, private fb: FormBuilder, private router: Router) {
    this.formulaire = this.fb.group({
      action: '',
      action_localite: [[]],
      sujet: [''],
      sujet_critere: [[]],
      sujet_localite: [[]],
      sujet_indicateur: [''],
      date_debut: [null],
      date_fin: [null]
    });
  }

  ngOnInit() {
    this.searchData();
  }

    toggleBack(): void {
    this.router.navigate(['/home']).then(nav => {
    }, err => {
      console.log(err)
    });
  }

  toggleSelection(controlName: string, value: string): void {
    const ctrl = this.formulaire.get(controlName);
    if (!ctrl) return;
  
    const currentValues: string[] = ctrl.value || [];
    const index = currentValues.indexOf(value);
  
    if (index > -1) {
      // Retirer la valeur
      currentValues.splice(index, 1);
    } else {
      // Ajouter la valeur
      currentValues.push(value);
    }
  
    // Set avec nouvelle référence pour Angular
    ctrl.setValue([...currentValues]);
  }
  
  isSelected(controlName: string, value: string): boolean {
    const ctrl = this.formulaire.get(controlName);
    if (!ctrl) return false;
    return (ctrl.value || []).includes(value);
  }

  onMultiSelectChange(event: Event, controlName: string): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValues = Array.from(selectElement.selectedOptions).map(option => option.value);
    this.formulaire.get(controlName)?.setValue(selectedValues);
  }

  // Pour gérer une sélection unique
  selectSingle(controlName: string, value: string): void {
    const ctrl = this.formulaire.get(controlName);
    if (!ctrl) return;

    const currentValue = ctrl.value;
    if (currentValue === value) {
      // Déselectionne si on reclique sur la même valeur (optionnel)
      ctrl.setValue(null);
    } else {
      ctrl.setValue(value);
    }
}

isSelectedSingle(controlName: string, value: string): boolean {
  const ctrl = this.formulaire.get(controlName);
  if (!ctrl) return false;
  return ctrl.value === value;
}

  get action_localite() {
    return this.formulaire.get('action_localite') as FormArray;
  }

  get sujet_localite() {
    return this.formulaire.get('sujet_localite') as FormArray;
  }

  addActionLocalite() {
    this.action_localite.push(this.fb.control('', Validators.required));
  }

  removeActionLocalite(index: number) {
    this.action_localite.removeAt(index);
  }

  addSujetLocalite() {
    this.sujet_localite.push(this.fb.control('', Validators.required));
  }

  removeSujetLocalite(index: number) {
    this.sujet_localite.removeAt(index);
  }

  onSubmit() {
    if (this.formulaire.valid) {
      this.searchData();
    } else {
      console.warn('Formulaire invalide');
    }
  }
  
  searchData() {
    this.devGatewayService.getIndicateurValue(
      this.formulaire
    ).subscribe(data2 => {
      console.log(data2)
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

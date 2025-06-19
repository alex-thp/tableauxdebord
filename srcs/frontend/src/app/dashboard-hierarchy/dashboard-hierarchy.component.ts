import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GatewayService } from '../gateway.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-hierarchy',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-hierarchy.component.html',
  styleUrls: ['./dashboard-hierarchy.component.css']
})
export class DashboardHierarchyComponent {
  data: any[] = [];
  today: Date = new Date();

  // filtres sélectionnés
  filtreLocalites: Set<string> = new Set();
  filtreActions: Set<string> = new Set();
  filtreSujets: Set<string> = new Set();

  // texte de recherche
  searchLocalite = '';
  searchAction = '';
  searchSujet = '';

  // états dropdown
  dropdownOpenLocalite = false;
  dropdownOpenAction = false;
  dropdownOpenSujet = false;

  constructor(private gatewayService: GatewayService) {}

  ngOnInit(): void {
    this.gatewayService.getdashboardData(this.today).subscribe(data => {
      this.data = data;
      console.log('Données reçues dans DashboardHierarchyComponent:', this.data);
    });
  }

  getFilteredData(): any[] {
    return this.data
      // 1. Filtrer les localités selon les filtres actifs
      .filter(loc => this.filtreLocalites.size === 0 || this.filtreLocalites.has(loc.label))

      // 2. Pour chaque localité retenue
      .map(loc => ({
        ...loc,
        next: this.filterSujets(loc.next)
      }))

      // 3. Supprimer les localités qui n'ont plus de sujets valides
      .filter(loc => loc.next.length > 0);
  }

  private filterSujets(sujets: any[]): any[] {
    return sujets
      // 1. Filtrer les sujets s’il y a des actions valides
      .map(sujet => ({
        ...sujet,
        next: this.filterActions(sujet.next)
      }))
      // 2. Supprimer les sujets qui n'ont plus d'actions valides
      .filter(s => s.next.length > 0);
  }

  private filterActions(actions: any[]): any[] {
    return actions
      // 1. Filtrer les actions selon le filtre actif
      .filter(action => this.filtreActions.size === 0 || this.filtreActions.has(action.label))

      // 2. Pour chaque action retenue, filtrer ses sous-sujets (niveau 4)
      .map(action => ({
        ...action,
        next: action.next.filter((su: { label: string; }) => this.filtreSujets.size === 0 || this.filtreSujets.has(su.label))
      }))

      // 3. Supprimer les actions qui n'ont plus de sous-sujets valides
      .filter(a => a.next.length > 0);
  }

  toggleSelection(type: 'localites'|'actions'|'sujets', value: string, checked: boolean) {
    const set = 
      type === 'localites' ? this.filtreLocalites :
      type === 'actions' ? this.filtreActions :
      this.filtreSujets;
    checked ? set.add(value) : set.delete(value);
  }

  getFilteredOptions(type: 'localites'|'actions'|'sujets'): string[] {
    const all = type === 'localites' ? 
      Array.from(new Set(this.data.map(d => d.label))) :
      type === 'actions' ? 
        Array.from(new Set(this.data.flatMap(d => d.next).flatMap((s:any)=>s.next).map((a:any)=>a.label))) :
        Array.from(new Set(this.data.flatMap(d=>d.next).flatMap((s:any)=>s.next).flatMap((a:any)=>a.next.map((su:any)=>su.label))));
    const search = (type==='localites' ? this.searchLocalite : type==='actions' ? this.searchAction : this.searchSujet).toLowerCase();
    return all.filter(o => o.toLowerCase().includes(search));
  }

  trackByFn(index: number, item: string): string {
    return item;
  }
}

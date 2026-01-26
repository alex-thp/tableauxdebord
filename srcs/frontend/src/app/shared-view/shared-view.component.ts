import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DevGatewayService } from '../pole-dev/dev-gateway.service';

@Component({
  selector: 'app-shared-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shared-view.component.html',
  styleUrls: ['./shared-view.component.css'],
})
export class SharedViewComponent implements OnInit {
  rapportXIndicateurId: string = '';
  formulaire!: FormGroup;
  result: any[] = [];
  filteredResult: any[] = [];
  error: string | null = null;
  filterPopupPosition = { top: 150, left: 50 };
  isDragging = false;
  dragStart = { x: 0, y: 0 };

  // Pour gestion filtres
  filterValues: { [key: string]: any[] } = {};
  selectedFilters: { [key: string]: any } = {};

  filterOpenForKey: string | null = null;

  dateFields: Set<string> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private devGatewayService: DevGatewayService
  ) {}

  ngOnInit(): void {
    this.formulaire = this.fb.group({});

    this.route.paramMap.subscribe((params) => {
      this.rapportXIndicateurId = params.get('rapport_x_indicateur') || '';

      if (!this.rapportXIndicateurId) {
        this.router.navigate(['/not_found']);
        return;
      }

      this.devGatewayService
        .getRapportXIndicateurPublic(this.rapportXIndicateurId)
        .subscribe({
          next: (data) => {
            if (data?.message) {
              this.router.navigate(['/not_found']);
            } else {
              this.buildForm(data);
              this.searchData();
            }
          },
          error: (err) => {
            if (err.status === 401) {
              this.router.navigate(['/login']);
            } else {
              this.router.navigate(['/not_found']);
            }
          },
        });
    });
  }

  buildForm(data: any): void {
    this.formulaire = this.fb.group({
      action: [data.action || ''],
      action_localite: [data.action_localite || []],
      sujet: [data.sujet || ''],
      sujet_critere: [data.sujet_critere || []],
      sujet_localite: [data.sujet_localite || []],
      sujet_indicateur: [data.sujet_indicateur || ''],
      date_debut: [data.date_debut || null],
      date_fin: [data.date_fin || null],
      structure_beneficiaire: [data.structure_beneficiaire || []],
    });
  }

  searchData(): void {
    if (this.formulaire.invalid) {
      this.error = 'Formulaire invalide.';
      return;
    }

    this.devGatewayService.getIndicateurValuePublic(this.formulaire).subscribe({
      next: (res) => {
        this.result = res || [];
        this.error = null;

        this.filteredResult = [...this.result];

        this.detectDateFields();
        this.buildFilterValues();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des données.';
        console.error(err);
      },
    });
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  detectDateFields(): void {
    this.dateFields.clear();
    if (!this.result.length) return;

    const keys = this.getKeys(this.result[0]);

    for (const key of keys) {
      const allDates = this.result.every((row) => {
        const val = row[key];
        return val != null && !isNaN(Date.parse(val));
      });

      if (allDates) {
        this.dateFields.add(key);
      }
    }
  }

  buildFilterValues(): void {
    this.filterValues = {};
    if (!this.result.length) return;

    const keys = this.getKeys(this.result[0]);

    for (const key of keys) {
      if (this.dateFields.has(key)) {
        this.filterValues[key] = [];
      } else {
        let uniqueValues = Array.from(
          new Set(this.result.map((r) => r[key]).filter((v) => v != null))
        );

        // Tri des valeurs selon type
        uniqueValues.sort((a, b) => {
          const aNum = Number(a);
          const bNum = Number(b);

          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }
          return a.toString().localeCompare(b.toString());
        });

        // Pour les nombres, on arrondit à 0 décimale avec toFixed(0) et on garde les strings
        uniqueValues = uniqueValues.map((val) => {
          const numVal = Number(val);
          if (!isNaN(numVal)) {
            return numVal.toFixed(0);
          }
          return val;
        });

        this.filterValues[key] = uniqueValues;
      }
    }
  }

  toggleFilter(key: string): void {
    if (this.filterOpenForKey === key) {
      this.filterOpenForKey = null;
    } else {
      this.filterOpenForKey = key;
    }
  }

  closeFilters(): void {
    this.filterOpenForKey = null;
  }

  applyFilter(key: string, option: string): void {
    if (!this.selectedFilters[key]) {
      this.selectedFilters[key] = [];
    }

    const index = this.selectedFilters[key].indexOf(option);
    if (index > -1) {
      this.selectedFilters[key].splice(index, 1);
      if (this.selectedFilters[key].length === 0) {
        delete this.selectedFilters[key];
      }
    } else {
      this.selectedFilters[key].push(option);
    }

    this.applyFilters();
  }

  onDateFilterChange(key: string, bound: 'min' | 'max', event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!this.selectedFilters[key]) {
      this.selectedFilters[key] = {};
    }

    this.selectedFilters[key][bound] = value;

    this.applyFilters();
  }

  isDateField(key: string): boolean {
    if (!this.result || this.result.length === 0) return false;
    return this.isDateString(this.result[0][key]);
  }

  isDateString(value: string): boolean {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    return (
      typeof value === 'string' &&
      isoDateRegex.test(value) &&
      !isNaN(Date.parse(value))
    );
  }

  applyFilters(): void {
    this.filteredResult = this.result.filter((row) => {
      for (const key in this.selectedFilters) {
        const filterVal = this.selectedFilters[key];

        if (this.dateFields.has(key)) {
          const rowDate = new Date(row[key]);
          if (filterVal.min && new Date(filterVal.min) > rowDate) {
            return false;
          }
          if (filterVal.max && new Date(filterVal.max) < rowDate) {
            return false;
          }
        } else {
          // filterVal est un tableau des options sélectionnées
          if (!filterVal.includes(row[key])) {
            return false;
          }
        }
      }
      return true;
    });
  }

  resetFilter(key: string): void {
    if (this.selectedFilters[key]) {
      delete this.selectedFilters[key];
      this.applyFilters();
    }
  }

  startDrag(event: MouseEvent): void {
    event.preventDefault();
    this.isDragging = true;
    this.dragStart.x = event.clientX - this.filterPopupPosition.left;
    this.dragStart.y = event.clientY - this.filterPopupPosition.top;

    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.stopDrag);
  }

  onDrag = (event: MouseEvent): void => {
    if (!this.isDragging) return;
    this.filterPopupPosition.left = event.clientX - this.dragStart.x;
    this.filterPopupPosition.top = event.clientY - this.dragStart.y;
  };

  stopDrag = (): void => {
    this.isDragging = false;
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.stopDrag);
  };

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-popup') && !target.closest('th')) {
      this.closeFilters();
    }
  }
}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GatewayService } from '../gateway.service';
import { CardComponent } from '../card/card.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-global-view',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './global-view.component.html',
  styleUrls: ['./global-view.component.css']
})
export class GlobalViewComponent implements OnInit {
  isLoading = true;
  data!: any;
  activeTab: number = 1;

  constructor(
    private _activatedRoute: ActivatedRoute, 
    private gatewayService: GatewayService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.gatewayService.getData().subscribe({
      next: (response) => {
        console.log('Données reçues (requête HTTP) :', response);
        this.data = response.data;
        console.log('Data mise à jour:', this.data);
        this.isLoading = false;
  
        // Force Angular à détecter les changements après la mise à jour de `data`
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors de la requête HTTP:', error);
        this.isLoading = false;
      }
    });
  }
}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GatewayService } from '../gateway.service';
import { CardComponent } from '../card/card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DeconnectionComponent } from '../connection/deconnection/deconnection.component';
import { PoleDevComponent } from '../pole-dev/pole-dev.component';

@Component({
  selector: 'app-global-view',
  standalone: true,
  imports: [CommonModule, CardComponent, DeconnectionComponent, PoleDevComponent],
  templateUrl: './global-view.component.html',
  styleUrls: ['./global-view.component.css']
})
export class GlobalViewComponent implements OnInit {
  isLoading = true;
  currentMaging = false;
  data!: any;
  activeTab: number = 1;

  constructor(
    private _activatedRoute: ActivatedRoute, 
    private gatewayService: GatewayService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.gatewayService.getData().subscribe({
      next: (response) => {
        console.log('Données reçues (requête HTTP) :', response);
        this.data = response.data;
        console.log('Data mise à jour:', this.data);
        this.isLoading = false;
        this.currentMaging = false;
  
        // Force Angular à détecter les changements après la mise à jour de `data`
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors de la requête HTTP:', error);
        this.currentMaging = false;
      }
    });
  }
  updateDataBase(): void {
    this.currentMaging = true;
    this.gatewayService.updateDataBase().subscribe({
      next: () => {
        console.log('MAJ réussie');
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.currentMaging = false;
      },
      complete: () => {
        this.currentMaging = false;
        location.reload();
      }
    });
  }

  goToBoussole() {
    this.router.navigate(['/boussole']).then(nav => {
      console.log(nav); // true if navigation is successful
    }, err => {
      console.log(err) // when there's an error
    });
  }
}

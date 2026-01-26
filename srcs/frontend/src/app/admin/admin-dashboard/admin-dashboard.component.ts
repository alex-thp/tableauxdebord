import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { GatewayService } from '../../gateway.service';
import { AdminComponent } from '../admin.component';
import { UserRoleManagementComponent } from '../user-role-management/user-role-management.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  imports: [CommonModule, UserRoleManagementComponent],
  standalone: true,
})
export class AdminDashboardComponent implements OnInit {
  message: string = '';
  secureData: number[] = [];
  error: string | null = null;

  constructor(private gatewayService: GatewayService) {}

  ngOnInit(): void {
    this.gatewayService.getAdminDashboardData().subscribe({
      next: (data) => {
        this.message = data.message;
        this.secureData = data.secureData;
      },
      error: (err) => {
        this.error =
          err.status === 403 ? 'Accès refusé (403)' : 'Erreur serveur';
      },
      complete: () => {
        console.log('Requête terminée');
      },
    });
  }
}

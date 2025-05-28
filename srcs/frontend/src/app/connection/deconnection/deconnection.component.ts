import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-deconnection',
  imports: [], // Ensure this is correctly placed within the @Component decorator
  templateUrl: './deconnection.component.html',
  styleUrl: './deconnection.component.css'
})
export class DeconnectionComponent {
  constructor(private authService: AuthService, private router: Router) {}

  Deconnection(): void {
    this.authService.logout();
    alert('Vous êtes déconnecté');
    this.router.navigate(['/login']);
  }
}

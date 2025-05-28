import { Component } from '@angular/core';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';

@Component({
  imports: [LoginComponent, SignupComponent, CommonModule],
  standalone: true,
  templateUrl: './connection.component.html',
  styleUrl: './connection.component.css'
})
export class ConnectionComponent {
  activeTab: 'login' | 'signup' = 'login';

  selectTab(tab: 'login' | 'signup') {
    this.activeTab = tab;
  }
}

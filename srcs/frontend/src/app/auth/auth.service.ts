import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/auth';
  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(res => {
          localStorage.setItem('jwt_token', res.access_token);
          console.log('Token JWT : ' + localStorage.getItem('jwt_token'));
          this.router.navigate(['home']);
        })
      );
  }

  logout() {
    localStorage.removeItem('jwt_token');
  }

  getToken(): string | null {
    // Récupère le token JWT depuis le localStorage
    return localStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

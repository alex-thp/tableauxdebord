import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/auth';
  constructor(private http: HttpClient, private router: Router) {}

login(email: string, password: string, redirectTo?: string | null) {
  return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, { email, password })
    .pipe(
      tap(res => {
        localStorage.setItem('jwt_token', res.access_token);
        const destination = redirectTo ?? '/home';
        console.log("destination : " + destination)
        this.router.navigateByUrl(destination);
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

  signUp(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, { email, password }).pipe(
        tap(res => {
          console.log(res);
          this.router.navigate(['/home']);
        })
      );

  }
}

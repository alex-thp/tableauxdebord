import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    const isPublicEndpoint =
      request.url.includes('/indicateurValue-public') ||
      request.url.includes('/some-other-public-endpoint');

    if (token && !isPublicEndpoint) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          //this.authService.logout();
          // 👇 Récupère l’URL visible par l’utilisateur
          const currentUrl = this.router.url;
          console.log(currentUrl);
          // Redirige vers /login avec redirectTo dans l’URL
          this.router.navigate(['/login'], {
            queryParams: { redirectTo: currentUrl },
          });
        }

        return throwError(() => error);
      })
    );
  }
}

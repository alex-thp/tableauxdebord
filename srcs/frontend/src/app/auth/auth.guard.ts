import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    console.log({ queryParams: { redirectTo: state.url } });
    // Redirige vers /login avec l'URL initiale en paramètre query redirectTo
    this.router.navigate(['/login'], {
      queryParams: { redirectTo: state.url },
    });
    return false;
  }
}

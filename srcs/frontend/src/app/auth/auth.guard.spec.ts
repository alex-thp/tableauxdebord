import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { AuthGuard } from './auth.guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (route, state) => 
      TestBed.runInInjectionContext(() => {
        const mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
        const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        return new AuthGuard(mockAuthService, mockRouter).canActivate(route, state);
      });

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { TokenService } from '../services/token-service/token-service';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));
  const check = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  it('redirects unauthenticated visitors to login', () => {
    const result = check() as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login');
  });
  it('allows a signed-in visitor', () => {
    TestBed.inject(TokenService).setToken('test-token');
    expect(check()).toBe(true);
  });
});

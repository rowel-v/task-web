import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionService } from '../services/session-service/session-service';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  const status = signal('authenticated');
  const session = { status, expire: vi.fn() };
  const router = { navigateByUrl: vi.fn() };

  beforeEach(() => {
    status.set('authenticated');
    session.expire.mockClear();
    router.navigateByUrl.mockClear();
    TestBed.configureTestingModule({
      providers: [
        { provide: SessionService, useValue: session },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('does not add a bearer token to protected requests', () => {
    const next = vi.fn((request: HttpRequest<unknown>) =>
      of(new HttpResponse({ url: request.url })),
    );
    TestBed.runInInjectionContext(() =>
      authInterceptor(new HttpRequest('GET', '/api/tasks'), next),
    );
    expect(next.mock.calls[0][0].headers.has('Authorization')).toBe(false);
  });

  it('expires an authenticated session when a protected request returns 401', () => {
    const next = () => throwError(() => new HttpErrorResponse({ status: 401 }));
    TestBed.runInInjectionContext(() =>
      authInterceptor(new HttpRequest('GET', '/api/tasks'), next),
    ).subscribe({ error: () => undefined });
    expect(session.expire).toHaveBeenCalledOnce();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('does not redirect for a rejected login or a session check', () => {
    const next = () => throwError(() => new HttpErrorResponse({ status: 401 }));
    TestBed.runInInjectionContext(() =>
      authInterceptor(new HttpRequest('POST', '/api/auth/login', null), next),
    ).subscribe({ error: () => undefined });
    status.set('checking');
    TestBed.runInInjectionContext(() =>
      authInterceptor(new HttpRequest('GET', '/api/tasks'), next),
    ).subscribe({ error: () => undefined });
    expect(session.expire).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});

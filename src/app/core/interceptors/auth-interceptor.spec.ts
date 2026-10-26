import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth-interceptor';
import { TokenService } from '../services/token-service/token-service';

describe('authInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({}));
  it.each(['/api/tasks', '/api/tasks/1', 'http://localhost:8080/api/tasks'])(
    'adds the token to %s',
    (url) => {
      TestBed.inject(TokenService).setToken('test-token');
      const next = vi.fn((_req: HttpRequest<unknown>) => of(new HttpResponse()));
      TestBed.runInInjectionContext(() => authInterceptor(new HttpRequest('GET', url), next));
      expect(next.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer test-token');
    },
  );
  it.each(['https://example.com/api/tasks', '/api/auth/login', '/api/tasks-other'])(
    'does not send the token to %s',
    (url) => {
      TestBed.inject(TokenService).setToken('test-token');
      const next = vi.fn((_req: HttpRequest<unknown>) => of(new HttpResponse()));
      TestBed.runInInjectionContext(() => authInterceptor(new HttpRequest('GET', url), next));
      expect(next.mock.calls[0][0].headers.has('Authorization')).toBe(false);
    },
  );
});

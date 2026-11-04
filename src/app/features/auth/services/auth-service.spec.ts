import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideDefaultClient } from '../../../api';
import { authInterceptor } from '../../../core/interceptors/auth-interceptor';
import { NotificationService } from '../../../core/services/notification-service/notification-service';
import { SessionService } from '../../../core/services/session-service/session-service';
import { AuthService } from './auth-service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideDefaultClient({ basePath: '' }),
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    document.cookie = 'XSRF-TOKEN=; Max-Age=0; Path=/';
  });

  it('loads CSRF before login and refreshes it after a successful login', () => {
    let completed = false;
    service.login({ username: 'alex', password: 'password' }).subscribe(() => (completed = true));
    document.cookie = 'XSRF-TOKEN=test-csrf; Path=/';
    http.expectOne('/api/auth/csrf').flush({ message: 'OK' });
    const login = http.expectOne('/api/auth/login');
    expect(login.request.headers.get('X-XSRF-TOKEN')).toBe('test-csrf');
    expect(login.request.headers.has('Authorization')).toBe(false);
    login.flush({ message: 'Logged in successfully', data: null });
    expect(completed).toBe(false);
    http.expectOne('/api/auth/csrf').flush({ message: 'OK' });
    expect(completed).toBe(true);
    expect(TestBed.inject(SessionService).status()).toBe('unknown');
  });

  it('requests CSRF before registration', () => {
    let completed = false;
    service
      .register({ username: 'alex', password: 'password' })
      .subscribe(() => (completed = true));
    http.expectOne('/api/auth/csrf').flush({ message: 'OK' });
    const register = http.expectOne('/api/auth/register');
    expect(register.request.method).toBe('POST');
    register.flush({ message: 'Account created', data: null });
    expect(completed).toBe(true);
  });

  it('reports a CSRF refresh failure separately after successful login', () => {
    service.login({ username: 'alex', password: 'password' }).subscribe({ error: () => undefined });
    http.expectOne('/api/auth/csrf').flush({ message: 'OK' });
    http.expectOne('/api/auth/login').flush({ message: 'Logged in', data: null });
    http.expectOne('/api/auth/csrf').flush({}, { status: 503, statusText: 'Unavailable' });
    expect(
      TestBed.inject(NotificationService)
        .notifications()
        .some((notification) => notification.message.includes('Signed in, but could not prepare')),
    ).toBe(true);
  });
});

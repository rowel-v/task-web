import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Login } from './login/login';
import { Register } from './register/register';
import { AuthService } from '../services/auth-service';

describe('Authentication pages', () => {
  const auth = { login: vi.fn(), register: vi.fn() };
  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });

  it('does not submit invalid login credentials', () => {
    const page = TestBed.createComponent(Login).componentInstance;
    page.onLogin();
    expect(auth.login).not.toHaveBeenCalled();
    expect(page.form.controls.username.touched).toBe(true);
  });

  it('signs in with the entered credentials and opens overview', () => {
    auth.login.mockReturnValue(of(undefined));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const page = TestBed.createComponent(Login).componentInstance;
    page.form.setValue({ username: ' rowel ', password: 'secret' });
    page.onLogin();
    expect(auth.login).toHaveBeenCalledWith({ username: 'rowel', password: 'secret' });
    expect(navigate).toHaveBeenCalledWith('/overview');
    expect(page.submitting()).toBe(false);
  });

  it('rejects passwords longer than the backend UTF-8 byte limit', () => {
    const page = TestBed.createComponent(Register).componentInstance;
    page.form.setValue({
      username: 'rowel',
      password: '€'.repeat(25),
      confirmPassword: '€'.repeat(25),
    });
    page.onSubmit();
    expect(page.form.controls.password.hasError('byteLimit')).toBe(true);
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('requires matching registration passwords', () => {
    const page = TestBed.createComponent(Register).componentInstance;
    page.form.setValue({ username: 'rowel', password: 'secret', confirmPassword: 'different' });
    page.onSubmit();
    expect(page.form.hasError('passwordMismatch')).toBe(true);
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('registers without sending the confirmation field and opens login', () => {
    auth.register.mockReturnValue(of(undefined));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const page = TestBed.createComponent(Register).componentInstance;
    page.form.setValue({ username: 'rowel', password: 'secret', confirmPassword: 'secret' });
    page.onSubmit();
    expect(auth.register).toHaveBeenCalledWith({ username: 'rowel', password: 'secret' });
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('blocks duplicate submissions while waiting', () => {
    auth.login.mockReturnValue(new Subject<void>());
    const page = TestBed.createComponent(Login).componentInstance;
    page.form.setValue({ username: 'rowel', password: 'secret' });
    page.onLogin();
    page.onLogin();
    expect(auth.login).toHaveBeenCalledTimes(1);
  });

  it('allows another attempt after an API error', () => {
    auth.login.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 401, error: { message: 'Invalid credentials' } }),
      ),
    );
    const fixture = TestBed.createComponent(Login);
    const page = fixture.componentInstance;
    page.form.setValue({ username: 'rowel', password: 'wrong' });
    page.onLogin();
    expect(page.submitting()).toBe(false);
    page.onLogin();
    expect(auth.login).toHaveBeenCalledTimes(2);
  });
  it('waits for the leave animation before opening registration', () => {
    vi.useFakeTimers();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const page = TestBed.createComponent(Login).componentInstance;
    page.goToRegister();
    expect(navigate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(navigate).toHaveBeenCalledWith('/register');
    vi.useRealTimers();
  });
});

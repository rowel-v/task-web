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
    page.submit();
    expect(auth.login).not.toHaveBeenCalled();
    expect(page.form.controls.username.touched).toBe(true);
  });

  it('signs in with the entered credentials and opens overview', () => {
    auth.login.mockReturnValue(of(undefined));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const page = TestBed.createComponent(Login).componentInstance;
    page.form.setValue({ username: ' rowel ', password: 'secret' });
    page.submit();
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
    page.submit();
    expect(page.form.controls.password.hasError('byteLimit')).toBe(true);
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('requires matching registration passwords', () => {
    const page = TestBed.createComponent(Register).componentInstance;
    page.form.setValue({ username: 'rowel', password: 'secret', confirmPassword: 'different' });
    page.submit();
    expect(page.form.hasError('passwordMismatch')).toBe(true);
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('registers without sending the confirmation field and opens login', () => {
    auth.register.mockReturnValue(of(undefined));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const page = TestBed.createComponent(Register).componentInstance;
    page.form.setValue({ username: 'rowel', password: 'secret', confirmPassword: 'secret' });
    page.submit();
    expect(auth.register).toHaveBeenCalledWith({ username: 'rowel', password: 'secret' });
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('blocks duplicate submissions while waiting', () => {
    auth.login.mockReturnValue(new Subject<void>());
    const page = TestBed.createComponent(Login).componentInstance;
    page.form.setValue({ username: 'rowel', password: 'secret' });
    page.submit();
    page.submit();
    expect(auth.login).toHaveBeenCalledTimes(1);
  });

  it('shows an API error and allows another attempt', () => {
    auth.login.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 401, error: { message: 'Invalid credentials' } }),
      ),
    );
    const fixture = TestBed.createComponent(Login);
    const page = fixture.componentInstance;
    page.form.setValue({ username: 'rowel', password: 'wrong' });
    page.submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Invalid credentials',
    );
    expect(page.submitting()).toBe(false);
  });
  it('waits for the actual leave animation before navigating', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const page = TestBed.createComponent(Login).componentInstance;
    let finish!: () => void;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const target = document.createElement('section');
    target.getAnimations = () => [{ finished }] as unknown as Animation[];
    const animationComplete = vi.fn();
    page.goToRegister();
    const leaving = page.onLeave({ target, animationComplete });
    expect(target.classList.contains('scale-out-hor-left')).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
    finish();
    await leaving;
    expect(animationComplete).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith('/register');
  });

  it('navigates when no CSS animation is running', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const page = TestBed.createComponent(Login).componentInstance;
    const target = document.createElement('section');
    target.getAnimations = () => [];
    page.goToRegister();
    await page.onLeave({ target, animationComplete: vi.fn() });
    expect(navigate).toHaveBeenCalledWith('/register');
  });
});


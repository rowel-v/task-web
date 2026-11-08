import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { LogoutDialog } from './logout-dialog';

describe('LogoutDialog', () => {
  let fixture: ComponentFixture<LogoutDialog>;
  const auth = { logout: vi.fn() };
  const showModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');

  beforeEach(() => {
    auth.logout.mockReset();
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: vi.fn(),
    });
    TestBed.configureTestingModule({
      imports: [LogoutDialog],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    fixture = TestBed.createComponent(LogoutDialog);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    if (showModal) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', showModal);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  });

  it('cancels without calling the logout API', () => {
    const cancelled = vi.fn();
    fixture.componentInstance.cancelled.subscribe(cancelled);
    const cancel = fixture.nativeElement.querySelector('app-button[variant="cancel"] button');
    cancel.click();
    expect(cancelled).toHaveBeenCalledOnce();
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('waits for logout to succeed before navigating and blocks duplicate requests', () => {
    const pending = new Subject<void>();
    auth.logout.mockReturnValue(pending);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const cancelled = vi.fn();
    fixture.componentInstance.cancelled.subscribe(cancelled);
    const button: HTMLButtonElement = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((item) => item.textContent?.trim() === 'Log out')!;
    button.click();
    fixture.detectChanges();
    button.click();
    expect(auth.logout).toHaveBeenCalledOnce();
    expect(button.disabled).toBe(true);
    const cancel = fixture.nativeElement.querySelector('app-button[variant="cancel"] button');
    expect(cancel.disabled).toBe(true);
    const escape = new Event('cancel', { cancelable: true });
    fixture.nativeElement.querySelector('dialog').dispatchEvent(escape);
    expect(escape.defaultPrevented).toBe(true);
    expect(cancelled).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    pending.next();
    pending.complete();
    expect(navigate).toHaveBeenCalledWith('/login', { replaceUrl: true });
  });

  it('allows the user to retry when logout fails', () => {
    auth.logout.mockReturnValue(throwError(() => new Error('Unavailable')));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const button: HTMLButtonElement = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((item) => item.textContent?.trim() === 'Log out')!;
    button.click();
    fixture.detectChanges();
    expect(button.disabled).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    button.click();
    expect(auth.logout).toHaveBeenCalledTimes(2);
  });
});

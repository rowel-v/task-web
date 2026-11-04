import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { TaskService } from '../../domains/tasks/services/task-service';
import { SessionService } from '../services/session-service/session-service';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  const tasks = { getAllTask: vi.fn(), clear: vi.fn() };

  beforeEach(() => {
    tasks.getAllTask.mockReset();
    tasks.clear.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: TaskService, useValue: tasks },
        { provide: HttpClient, useValue: { get: () => of({}) } },
      ],
    });
  });

  const check = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/tasks/all' } as RouterStateSnapshot),
    );

  it('restores a session and reuses the loaded task data', async () => {
    tasks.getAllTask.mockReturnValue(of([]));
    expect(await firstValueFrom(check() as Observable<boolean | UrlTree>)).toBe(true);
    expect(TestBed.inject(SessionService).status()).toBe('authenticated');
    expect(tasks.getAllTask).toHaveBeenCalledTimes(1);
    expect(await firstValueFrom(check() as Observable<boolean | UrlTree>)).toBe(true);
    expect(tasks.getAllTask).toHaveBeenCalledTimes(1);
  });

  it('redirects to login when the backend rejects the cookie', async () => {
    tasks.getAllTask.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    const result = await firstValueFrom(check() as Observable<boolean | UrlTree>);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/login');
    expect(TestBed.inject(SessionService).status()).toBe('unauthenticated');
    expect(tasks.clear).toHaveBeenCalled();
  });

  it('keeps server errors separate from unauthenticated sessions and retries', async () => {
    tasks.getAllTask
      .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 503 })))
      .mockReturnValueOnce(of([]));
    expect(await firstValueFrom(check() as Observable<boolean | UrlTree>)).toBe(false);
    const session = TestBed.inject(SessionService);
    expect(session.status()).toBe('error');
    expect(session.getAttemptedUrl()).toBe('/tasks/all');
    expect(await firstValueFrom(session.restoreSession())).toBe(true);
    expect(session.status()).toBe('authenticated');
  });
});

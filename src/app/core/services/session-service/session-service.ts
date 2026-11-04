import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, of, switchMap } from 'rxjs';
import { TaskService } from '../../../domains/tasks/services/task-service';

type SessionStatus = 'unknown' | 'checking' | 'authenticated' | 'unauthenticated' | 'error';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly tasks = inject(TaskService);
  private readonly http = inject(HttpClient);
  private readonly sessionStatus = signal<SessionStatus>('unknown');
  readonly status = this.sessionStatus.asReadonly();
  private attemptedUrl = '/overview';

  checkSession(url: string): Observable<boolean | null> {
    this.attemptedUrl = url;
    if (this.status() === 'authenticated') return of(true);
    if (this.status() === 'unauthenticated') return of(false);
    return this.restoreSession();
  }

  restoreSession(): Observable<boolean | null> {
    this.sessionStatus.set('checking');
    return this.http.get('/api/auth/csrf').pipe(
      switchMap(() => this.tasks.getAllTask(false)),
      map(() => {
        this.sessionStatus.set('authenticated');
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.expire();
          return of(false);
        }
        this.sessionStatus.set('error');
        return of(null);
      }),
      finalize(() => {
        if (this.status() === 'checking') this.sessionStatus.set('unknown');
      }),
    );
  }

  getAttemptedUrl(): string {
    return this.attemptedUrl;
  }

  reset(): void {
    this.tasks.clear();
    this.sessionStatus.set('unknown');
  }

  expire(): void {
    this.tasks.clear();
    this.sessionStatus.set('unauthenticated');
  }
}

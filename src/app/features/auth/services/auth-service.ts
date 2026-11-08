import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, switchMap, tap, throwError } from 'rxjs';
import {
  ApiResponseVoid,
  AuthControllerService,
  CreateAccountRequest,
  LoginAccountRequest,
} from '../../../api';
import { NotificationService } from '../../../core/services/notification-service/notification-service';
import { SessionService } from '../../../core/services/session-service/session-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(AuthControllerService);
  private readonly http = inject(HttpClient);
  private readonly appNotification = inject(NotificationService);
  private readonly session = inject(SessionService);

  private getCsrfToken(): Observable<unknown> {
    return this.http.get('/api/auth/csrf');
  }

  register(req: CreateAccountRequest): Observable<void> {
    return this.getCsrfToken().pipe(
      switchMap(() => this.api.register(req)),
      tap((result) => this.appNotification.success(result.message)),
      map(() => undefined),
      catchError((err: HttpErrorResponse) => this.handleError(err)),
    );
  }

  login(req: LoginAccountRequest): Observable<void> {
    return this.getCsrfToken().pipe(
      switchMap(() => this.api.login(req)),
      catchError((err: HttpErrorResponse) => this.handleError(err)),
      tap(() => this.session.reset()),
      switchMap((result) =>
        this.getCsrfToken().pipe(
          map(() => result),
          catchError((err: HttpErrorResponse) => {
            this.appNotification.error(
              'Signed in, but could not prepare the security token. Please try again.',
            );
            return throwError(() => err);
          }),
        ),
      ),
      tap((result) => this.appNotification.success(result.message)),
      map(() => undefined),
    );
  }

  logout(): Observable<void> {
    return this.getCsrfToken().pipe(
      switchMap(() => this.api.logout()),
      tap(() => this.session.expire()),
      tap((result) => this.appNotification.success(result.message)),
      map(() => undefined),
      catchError((err: HttpErrorResponse) => this.handleError(err)),
    );
  }

  private readonly handleError = (err: HttpErrorResponse) => {
    const errorResponse = err.error as ApiResponseVoid | null;
    const errorMessage = errorResponse?.message ?? 'Something went wrong. Please try again.';
    this.appNotification.error(errorMessage);
    return throwError(() => err);
  };
}

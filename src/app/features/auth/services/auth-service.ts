import { inject, Injectable } from '@angular/core';
import { AuthControllerService, CreateAccountRequest, LoginAccountRequest } from '../../../api';
import { NotificationService } from '../../../core/services/notification-service/notification-service';
import { TokenService } from '../../../core/services/token-service/token-service';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponseVoid } from '../../../api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(AuthControllerService);
  private readonly appNotification = inject(NotificationService);
  private readonly tokenService = inject(TokenService);

  register(req: CreateAccountRequest): Observable<void> {
    return this.api.register(req).pipe(
      tap((result) => this.appNotification.success(result.message)),
      map(() => undefined),
      catchError((err: HttpErrorResponse) => this.handleError(err)),
    );
  }

  login(req: LoginAccountRequest): Observable<void> {
    return this.api.login(req).pipe(
      tap((result) => this.tokenService.setToken(result.data!.token!)),
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

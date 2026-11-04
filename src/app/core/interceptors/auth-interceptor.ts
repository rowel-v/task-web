import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionService } from '../services/session-service/session-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);

  // Only expire the session for protected API requests.
  const taskApi =
    /^\/api\/(?:tasks|profile)(?:[/?#]|$)/.test(req.url) ||
    /^http:\/\/localhost:8080\/api\/(?:tasks|profile)(?:[/?#]|$)/.test(req.url);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        taskApi &&
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        session.status() === 'authenticated'
      ) {
        session.expire();
        void router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};

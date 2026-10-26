import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token-service/token-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenService).getToken();

  // Only send the token to your backend.
  const taskApi =
    /^\/api\/tasks(?:[/?#]|$)/.test(req.url) ||
    /^http:\/\/localhost:8080\/api\/tasks(?:[/?#]|$)/.test(req.url);
  if (!token || !taskApi) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

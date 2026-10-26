import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token-service/token-service';

export const authGuard: CanActivateFn = () =>
  inject(TokenService).getToken() ? true : inject(Router).createUrlTree(['/login']);

import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { SessionService } from '../services/session-service/session-service';

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return router.createUrlTree(['/login']);
  return inject(SessionService)
    .checkSession(state.url)
    .pipe(
      map((authenticated) => {
        if (authenticated === null) return false;
        if (authenticated) return true;
        return router.createUrlTree(['/login']);
      }),
    );
};

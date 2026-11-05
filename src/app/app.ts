import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { LoadingOverlay } from './shared/components/loading-overlay/loading-overlay';
import { ServerError } from './shared/components/server-error/server-error';
import { NotificationToast } from './shared/components/notification-toast/notification-toast';
import { SessionService } from './core/services/session-service/session-service';
import { DisplayPreferencesService } from './core/services/display-preferences-service/display-preferences-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [RouterOutlet, LoadingOverlay, ServerError, NotificationToast],
})
export class App {
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    inject(DisplayPreferencesService);
  }

  protected onRetry() {
    this.session
      .restoreSession()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((authenticated) => {
        if (authenticated === null) return;
        void this.router.navigateByUrl(authenticated ? this.session.getAttemptedUrl() : '/login', {
          onSameUrlNavigation: 'reload',
        });
      });
  }
}

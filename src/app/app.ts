import { Component, effect, inject, PLATFORM_ID, signal, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskService } from './domains/tasks/services/task-service';
import { isPlatformBrowser } from '@angular/common';
import { LoadingOverlay } from './shared/components/loading-overlay/loading-overlay';
import { ServerError } from './shared/components/server-error/server-error';
import { NotificationToast } from './shared/components/notification-toast/notification-toast';
import { TokenService } from './core/services/token-service/token-service';

type FetchStatus = 'FETCHING' | 'SUCCESS' | 'FAILED';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [RouterOutlet, LoadingOverlay, ServerError, NotificationToast],
})
export class App {
  // fetches the initial task list
  private readonly taskService = inject(TaskService);

  // loading state of the first task fetch
  protected readonly fetchStatus = signal<FetchStatus>('SUCCESS');

  constructor() {
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    const tokens = inject(TokenService);
    effect((onCleanup) => {
      const token = tokens.getToken();
      if (!browser || !token) {
        this.fetchStatus.set('SUCCESS');
        return;
      }
      const request = untracked(() => this.loadTasks());
      onCleanup(() => request.unsubscribe());
    });
  }

  protected onRetry() {
    this.loadTasks();
  }

  private loadTasks() {
    this.fetchStatus.set('FETCHING');

    return this.taskService.getAllTask().subscribe({
      next: () => this.fetchStatus.set('SUCCESS'),
      error: () => this.fetchStatus.set('FAILED'),
    });
  }
}

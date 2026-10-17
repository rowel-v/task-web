import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskService } from './core/services/task-service/task-service';
import { isPlatformBrowser } from '@angular/common';
import { LoadingOverlay } from './shared/components/loading-overlay/loading-overlay';
import { ServerError } from './shared/components/server-error/server-error';
import { NotificationToast } from './shared/components/notification-toast/notification-toast';

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
  protected readonly fetchStatus = signal<FetchStatus>('FETCHING');

  constructor() {
    // skip on the server so SSR and ng build don't wait for the backend
    // (the server renders the spinner, which matches the browser's first render)
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    this.loadTasks();
  }

  protected onRetry() {
    this.loadTasks();
  }

  private loadTasks(): void {
    this.fetchStatus.set('FETCHING');

    this.taskService.getAllTask().subscribe({
      next: () => this.fetchStatus.set('SUCCESS'),
      error: () => this.fetchStatus.set('FAILED'),
    });
  }
}

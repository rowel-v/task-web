import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskService } from './core/services/task-service/task-service';
import { isPlatformBrowser } from '@angular/common';
import { NotificationService } from './core/services/notification-service/notification-service';
import { LucideCloudOff } from '@lucide/angular';

type FetchStatus = 'FETCHING' | 'SUCCESS' | 'FAILED';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [RouterOutlet, LucideCloudOff],
})
export class App {
  // fetches the initial task list
  private readonly taskService = inject(TaskService);
  // shows the toast messages in the template
  protected readonly appNotification = inject(NotificationService);

  // loading state of the first task fetch
  protected readonly fetchStatus = signal<FetchStatus>('FETCHING');

  constructor() {
    // skip on the server so SSR and ng build don't wait for the backend
    // (the server renders the spinner, which matches the browser's first render)
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    this.loadTasks();
  }

  protected retry() {
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

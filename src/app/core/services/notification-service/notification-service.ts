import { Injectable, signal } from '@angular/core';

export interface AppNotification {
  id: number;
  type: 'success' | 'error';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<AppNotification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  private nextId = 0;

  success(message: string) {
    this.show('success', message);
  }

  error(message: string) {
    this.show('error', message);
  }

  // removes one notification by id (also used by an X button)
  dismiss(id: number) {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  private show(type: AppNotification['type'], message: string) {
    const id = this.nextId++;
    this._notifications.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 5000); // each notifications has its own timer
  }
}

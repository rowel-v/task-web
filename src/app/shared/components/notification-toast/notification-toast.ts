import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification-service/notification-service';

@Component({
  selector: 'app-notification-toast',
  imports: [],
  templateUrl: './notification-toast.html',
  styles: ``,
})
export class NotificationToast {
  protected readonly appNotification = inject(NotificationService);
}

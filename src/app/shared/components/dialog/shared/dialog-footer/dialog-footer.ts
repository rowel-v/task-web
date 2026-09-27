import { Component, input, output } from '@angular/core';
import { Task } from '../../../../models/task';
import {
  TaskStatusAction,
  TaskStatusChangeRequest,
} from '../../task-details-dialog/task-details-dialog';
import { LucideCheck, LucidePlay } from '@lucide/angular';
import { CancelButton } from '../../../buttons/cancel-button/cancel-button';
import { Button } from '../../../buttons/button/button';

@Component({
  selector: 'app-dialog-footer',
  imports: [LucidePlay, LucideCheck, CancelButton, Button],
  templateUrl: './dialog-footer.html',
  styles: ``,
})
export class DialogFooter {
  task = input.required<Task>();
  isLoading = input.required<boolean>();
  cancelled = output<void>();
  statusChangeRequested = output<TaskStatusChangeRequest>();
  protected onStatusChangeRequested(action: TaskStatusAction) {
    this.statusChangeRequested.emit({ action, targetTask: this.task() });
  }
}

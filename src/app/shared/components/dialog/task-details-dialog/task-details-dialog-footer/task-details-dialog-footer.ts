import { Component, input, output } from '@angular/core';
import { Task } from '../../../../models/task';
import { LucideCheck, LucidePlay } from '@lucide/angular';
import {
  TaskStatusAction,
  TaskStatusChangeRequest,
} from '../../task-details-dialog/task-details-dialog';
import { Button } from '../../../button/button';

@Component({
  selector: 'app-task-details-dialog-footer',
  imports: [LucidePlay, LucideCheck, Button],
  templateUrl: './task-details-dialog-footer.html',
  styles: ``,
})
export class TaskDetailsDialogFooter {
  task = input.required<Task>();
  isLoading = input.required<boolean>();
  cancelled = output<void>();
  statusChangeRequested = output<TaskStatusChangeRequest>();
  protected onStatusChangeRequested(action: TaskStatusAction) {
    this.statusChangeRequested.emit({ action, targetTask: this.task() });
  }
}

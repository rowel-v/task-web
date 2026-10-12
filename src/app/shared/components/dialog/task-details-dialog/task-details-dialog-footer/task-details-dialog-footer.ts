import { Component, input, output } from '@angular/core';
import { Task } from '../../../../../core/models/task';
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
  protected onStatusChangeRequested(req: { action?: TaskStatusAction; reopen?: boolean }) {
    this.statusChangeRequested.emit({
      action: req.action!,
      targetTask: this.task(),
      reopen: req.reopen,
    });
  }
}

import { Component, input, output } from '@angular/core';
import { Task } from '../../../../../domains/tasks/models/task';
import { LucideArchive, LucideCheck, LucidePlay } from '@lucide/angular';
import {
  TaskStatusAction,
  TaskStatusChangeRequest,
} from '../../task-details-dialog/task-details-dialog';
import { Button } from '../../../../../shared/components/button/button';

@Component({
  selector: 'app-task-details-dialog-footer',
  imports: [LucidePlay, LucideCheck, LucideArchive, Button],
  templateUrl: './task-details-dialog-footer.html',
  styles: ``,
})
export class TaskDetailsDialogFooter {
  task = input.required<Task>();
  isLoading = input.required<boolean>();
  cancelled = output<void>();
  statusChangeRequested = output<TaskStatusChangeRequest>();
  protected onStatusChangeRequested(req: { action?: TaskStatusAction; archive?: boolean }) {
    if (this.task().archive || this.isLoading()) {
      return;
    }

    this.statusChangeRequested.emit({
      action: req.action!,
      targetTask: this.task(),
      archive: req.archive,
    });
  }
}

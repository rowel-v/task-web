import { Component, input, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { TasksStatusBadge } from '../../../tasks-status-badge/tasks-status-badge';
import { TaskStatus } from '../../../../models/task';
import { Button } from '../../../button/button';

@Component({
  selector: 'app-task-details-dialog-header',
  imports: [TasksStatusBadge, TitleCasePipe, Button],
  templateUrl: './task-details-dialog-header.html',
  styles: ``,
})
export class TaskDetailsDialogHeader {
  title = input.required<string>();
  status = input.required<TaskStatus>();
  disableCloseButton = input.required<boolean>();
  closed = output<void>();
}

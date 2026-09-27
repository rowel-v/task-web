import { Component, input, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { LucideX } from '@lucide/angular';
import { TasksStatusBadge } from '../../../tasks-status-badge/tasks-status-badge';
import { TaskStatus } from '../../../../models/task';
import { AppButtonVariant } from '../../../../directives/app-button-variant';
import { CloseButton } from '../../../buttons/close-button/close-button';

@Component({
  selector: 'app-dialog-header',
  imports: [TasksStatusBadge, TitleCasePipe, LucideX, AppButtonVariant, CloseButton],
  templateUrl: './dialog-header.html',
  styles: ``,
})
export class DialogHeader {
  title = input.required<string>();
  status = input.required<TaskStatus>();
  isLoading = input.required<boolean>();
  closed = output<void>();
}

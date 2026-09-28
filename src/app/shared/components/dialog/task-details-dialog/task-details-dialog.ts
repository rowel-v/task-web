import { afterNextRender, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { Task } from '../../../models/task';
import { TaskDetailsDialogFooter } from './task-details-dialog-footer/task-details-dialog-footer';
import { TaskDetailsDialogContent } from './task-details-dialog-content/task-details-dialog-content';
import { TaskDetailsDialogHeader } from './task-details-dialog-header/task-details-dialog-header';

export type TaskStatusAction = 'START' | 'COMPLETE' | 'REOPEN';
export interface TaskStatusChangeRequest {
  action: TaskStatusAction;
  targetTask: Task;
}

@Component({
  selector: 'app-task-details-dialog',
  imports: [TaskDetailsDialogHeader, TaskDetailsDialogContent, TaskDetailsDialogFooter],
  templateUrl: './task-details-dialog.html',
  styles: ``,
})
export class TaskDetailsDialog {
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');
  constructor() {
    afterNextRender(() => {
      this.dialogRef().nativeElement.showModal();
    });
  }

  task = input.required<Task>();
  isClosing = input(false);
  isLoading = input(false);
  errorMessage = input<string | null>(null);
  closed = output<void>();
  statusChangeRequested = output<TaskStatusChangeRequest>();

  protected onBackdropClick(event: MouseEvent) {
    if (!this.isLoading() && event.target === this.dialogRef().nativeElement) {
      this.closed.emit();
    }
  }
}

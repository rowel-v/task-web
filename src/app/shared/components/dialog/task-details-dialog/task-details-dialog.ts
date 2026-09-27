import { afterNextRender, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { Task } from '../../../models/task';

import { DialogContent } from './dialog-content/dialog-content';
import { DialogHeader } from './dialog-header/dialog-header';
import { DialogFooter } from '../shared/dialog-footer/dialog-footer';

export type TaskStatusAction = 'START' | 'COMPLETE' | 'REOPEN';
export interface TaskStatusChangeRequest {
  action: TaskStatusAction;
  targetTask: Task;
}

@Component({
  selector: 'app-task-details-dialog',
  imports: [DialogHeader, DialogContent, DialogFooter],
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

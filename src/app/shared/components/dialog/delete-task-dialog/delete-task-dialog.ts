import { Component, input, output } from '@angular/core';
import { Task } from '../../../models/task';
import { LucideTriangleAlert, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-delete-task-dialog',
  imports: [LucideTriangleAlert, LucideX],
  templateUrl: './delete-task-dialog.html',
  styles: ``,
})
export class DeleteTaskDialog {
  task = input.required<Task>();
  isClosing = input<boolean>(false);
  isDeleting = input<boolean>(false);
  errorMessage = input<string | null>(null);

  cancelled = output<void>();
  confirmed = output<Task>();
}

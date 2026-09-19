import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Task, TaskPriority, TaskStatus } from '../../../models/task';
import { LucideX } from '@lucide/angular';

@Component({
  selector: 'app-create-task-dialog',
  imports: [LucideX],
  templateUrl: './create-task-dialog.html',
  styles: ``,
})
export class CreateTaskDialog {

  submitted = output<Task>();
  cancelled = output<void>();
  isClosing = input.required<boolean>();
  taskForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    description: new FormControl('', {
      nonNullable: true,
    }),

    priority: new FormControl<TaskPriority>('LOW', {
      nonNullable: true,
    }),

    status: new FormControl<TaskStatus>('PENDING', {
      nonNullable: true,
    }),

    dueDate: new FormControl<Date | null>(null, {
      validators: [Validators.required],
    }),
    dueTime: new FormControl<Date | null>(null, {
      validators: [Validators.required],
    }),
  });
}

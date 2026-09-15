import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Todo, TodoPriority, TodoStatus } from '../../../models/todo';
import { LucideX } from '@lucide/angular';

@Component({
  selector: 'app-create-task-dialog',
  imports: [LucideX],
  templateUrl: './create-task-dialog.html',
  styles: ``,
})
export class CreateTaskDialog {

  submitted = output<Todo>();
  cancelled = output<void>();
  isClosing = input.required<boolean>();
  todoForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    description: new FormControl('', {
      nonNullable: true,
    }),

    priority: new FormControl<TodoPriority>('low', {
      nonNullable: true,
    }),

    status: new FormControl<TodoStatus>('pending', {
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

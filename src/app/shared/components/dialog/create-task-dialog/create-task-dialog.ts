import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskPriority } from '../../../models/task';
import { LucideX } from '@lucide/angular';
import { CreateTaskRequest } from '../../../models/request/create-task-request';

@Component({
  selector: 'app-create-task-dialog',
  imports: [LucideX, ReactiveFormsModule],
  templateUrl: './create-task-dialog.html',
  styles: ``,
})
export class CreateTaskDialog {
  submitted = output<CreateTaskRequest>();
  cancelled = output<void>();
  isClosing = input.required<boolean>();
  isLoading = input.required<boolean>();
  errorMessage = input<string | null>(null);
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

    dueDate: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    dueTime: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
  });

  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const { dueDate, dueTime, ...rest } = this.taskForm.getRawValue();
    // dueDate: "2026-01-15", dueTime: "14:30"
    const parsedDueDate = new Date(`${dueDate}T${dueTime}`);
    const payload: CreateTaskRequest = {
      ...rest,
      dueDate: parsedDueDate.toISOString(),
    };

    console.log(payload);
    this.submitted.emit(payload);
  }
}

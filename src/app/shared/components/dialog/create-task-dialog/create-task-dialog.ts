import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskPriority } from '../../../models/task';
import { LucideX } from '@lucide/angular';
import { CreateTaskRequest } from '../../../models/request/create-task-request';
import { DateTimePicker } from '../../date-time-picker/date-time-picker';

@Component({
  selector: 'app-create-task-dialog',
  imports: [LucideX, ReactiveFormsModule, DateTimePicker],
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
  });

  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const { dueDate, ...rest } = this.taskForm.getRawValue();
    // dueDate: "2026-01-15", dueTime: "14:30"
    const parsedDueDate = new Date(`${dueDate}`);
    const payload: CreateTaskRequest = {
      ...rest,
      dueDate: parsedDueDate.toISOString(),
    };

    console.log(payload);
    this.submitted.emit(payload);
  }

  protected readonly minDate = new Date().toISOString().split('T')[0]; // "2026-09-21"

  protected isToday(): boolean {
    const selected = this.taskForm.controls.dueDate.value;
    return selected === this.minDate;
  }

  protected get minTime(): string {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // "HH:mm"
  }
}

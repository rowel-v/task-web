import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskPriority } from '../../../models/task';
import { LucideX } from '@lucide/angular';
import { CreateTaskRequest } from '../../../models/request/create-task-request';
import { DateTimePicker } from '../../date-time-picker/date-time-picker';
import { toSignal } from '@angular/core/rxjs-interop';

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
  protected readonly taskForm = new FormGroup({
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

  private readonly taskFormValueSignal = toSignal(this.taskForm.valueChanges, {
    initialValue: this.taskForm.value,
  });

  taskFormLogger = effect(() => {
    const currentValue = this.taskFormValueSignal();
    console.log('current taskform value: ', currentValue);
  });

  protected onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const { dueDate, ...rest } = this.taskForm.getRawValue();
    const parsedDueDate = new Date(`${dueDate}`);
    const payload: CreateTaskRequest = {
      ...rest,
      dueDate: parsedDueDate.toISOString(),
    };
    this.submitted.emit(payload);
  }
}

import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskPriority } from '../../../models/task';
import { CreateTaskRequest } from '../../../models/request/create-task-request';
import { DateTimePicker } from '../../date-time-picker/date-time-picker';
import { toSignal } from '@angular/core/rxjs-interop';
import { DialogFooter } from '../shared/dialog-footer/dialog-footer';
import { DialogHeader } from '../shared/dialog-header/dialog-header';

@Component({
  selector: 'app-create-task-dialog',
  imports: [ReactiveFormsModule, DateTimePicker, DialogFooter, DialogHeader],
  templateUrl: './create-task-dialog.html',
  styles: ``,
})
export class CreateTaskDialog {
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');
  constructor() {
    afterNextRender(() => {
      this.dialogRef().nativeElement.showModal();
    });
  }

  closed = output<void>();
  submitted = output<CreateTaskRequest>();
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

  protected onBackdropClick(event: MouseEvent) {
    if (!this.isLoading() && event.target === this.dialogRef().nativeElement) {
      this.closed.emit();
    }
  }
}

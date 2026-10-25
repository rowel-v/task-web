import {
  Component,
  input,
  output,
  OnInit,
  afterNextRender,
  viewChild,
  ElementRef,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogFooter } from '../../../../shared/components/dialog/dialog-footer/dialog-footer';
import { DialogHeader } from '../../../../shared/components/dialog/dialog-header/dialog-header';
import { DateTimePicker } from '../../../../shared/components/dialog/date-time-picker/date-time-picker';
import { Task, TaskStatus, TaskPriority } from '../../../../domains/tasks/models/task';
import { UpdateTaskRequest } from '../../../../api';

@Component({
  selector: 'app-edit-task-dialog',
  imports: [ReactiveFormsModule, DateTimePicker, DialogHeader, DialogFooter],
  templateUrl: './edit-task-dialog.html',
  styles: ``,
})
export class EditTaskDialog implements OnInit {
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');
  constructor() {
    afterNextRender(() => {
      this.dialogRef().nativeElement.showModal();
    });
  }

  ngOnInit() {
    const task = this.task();
    this.taskForm.patchValue({
      name: task.name,
      description: task.description ?? '',
      priority: task.priority,
      dueDate: task.dueDate,
    });
  }

  task = input.required<Task>();
  isClosing = input<boolean>(false);
  isUpdating = input<boolean>(false);

  submitted = output<{ taskId: number; req: UpdateTaskRequest }>();
  cancelled = output<void>();

  protected taskForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    priority: new FormControl<TaskPriority>('LOW', { nonNullable: true }),
    status: new FormControl<TaskStatus>('PENDING', { nonNullable: true }),

    dueDate: new FormControl<string | null>(null, { validators: [Validators.required] }),
  });

  protected onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const { dueDate, ...rest } = this.taskForm.getRawValue();
    const parsedDueDate = new Date(`${dueDate}`);

    const payload: UpdateTaskRequest = {
      ...rest,
      dueDate: parsedDueDate.toISOString(),
    };

    this.submitted.emit({ taskId: this.task().id, req: payload });
  }
}

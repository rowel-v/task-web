import { Component, input, output, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UpdateTaskRequest } from '../../../models/request/update-task-request';
import { Task, TaskPriority, TaskStatus } from '../../../models/task';
import { LucideX } from '@lucide/angular';
import { DateTimePicker } from '../../date-time-picker/date-time-picker';

@Component({
  selector: 'app-edit-task-dialog',
  imports: [ReactiveFormsModule, LucideX, DateTimePicker],
  templateUrl: './edit-task-dialog.html',
  styles: ``,
})
export class EditTaskDialog implements OnInit {
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
  errorMessage = input<string | null>(null);

  submitted = output<{ taskId: number; req: UpdateTaskRequest }>();
  cancelled = output<void>();

  taskForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    priority: new FormControl<TaskPriority>('LOW', { nonNullable: true }),
    status: new FormControl<TaskStatus>('PENDING', { nonNullable: true }),
    dueDate: new FormControl<string | null>(null, { validators: [Validators.required] }),
  });

  onSubmit(): void {
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

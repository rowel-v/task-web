import { Component, computed, inject, Signal, signal } from '@angular/core';
import { TaskService } from '../../core/services/task-service/task-service';
import { RouterLink } from '@angular/router';
import { Task } from '../../shared/models/task';
import { TotalTasksDetailsModal } from './total-tasks-details-modal/total-tasks-details-modal';
import { TasksStatusCard } from './tasks-status-card/tasks-status-card';
import { PendingTasksDetailsModal } from './pending-tasks-details-modal/pending-tasks-details-modal';
import { InprogressTasksDetailsModal } from './inprogress-tasks-details-modal/inprogress-tasks-details-modal';
import { CompletedTasksDetailsModal } from './completed-tasks-details-modal/completed-tasks-details-modal';
import { LucideArrowRight, LucidePlus } from '@lucide/angular';
import { TasksStatusBadge } from '../../shared/components/tasks-status-badge/tasks-status-badge';
import { CreateTaskDialog } from '../../shared/components/dialog/create-task-dialog/create-task-dialog';
import {
  TaskDetailsDialog,
  TaskStatusAction,
} from '../../shared/components/dialog/task-details-dialog/task-details-dialog';
import { DatePipe } from '@angular/common';
import { TaskItem } from './task-item/task-item';
import { TaskEmptyState } from './task-empty-state/task-empty-state';
import { CreateTaskRequest } from '../../shared/models/request/create-task-request';
import { finalize } from 'rxjs';

type TasksDetailsFlag = 'total' | 'pending' | 'in_progress' | 'completed' | null;
type ModalSelection = 'create-task-dialog' | 'task-details-dialog' | null;

@Component({
  selector: 'app-overview',
  imports: [
    RouterLink,
    TotalTasksDetailsModal,
    TasksStatusCard,
    PendingTasksDetailsModal,
    InprogressTasksDetailsModal,
    CompletedTasksDetailsModal,
    LucidePlus,
    TasksStatusBadge,
    LucideArrowRight,
    CreateTaskDialog,
    TaskDetailsDialog,
    DatePipe,
    TaskItem,
    TaskEmptyState,
  ],
  templateUrl: './overview.html',
  styles: ``,
})
export class Overview {
  private readonly taskService = inject(TaskService);
  protected readonly tasks: Signal<Task[]> = this.taskService.tasks;
  protected selectedTask = signal<Task | null>(null);
  protected modalTasksDetails: TasksDetailsFlag = null;
  protected tasksDetailsFlag = signal<TasksDetailsFlag>(null);
  protected isClosing = signal(false);
  // limit to 5 the displayed tasks in overview
  protected displayedTodaysTasks = computed(() => this.taskService.todaysTasks().slice(0, 5));

  protected openModal = signal<ModalSelection>(null);

  protected closeModal() {
    if (this.isClosing()) {
      return;
    }
    this.isClosing.set(true);
    setTimeout(() => {
      this.openModal.set(null);
      this.isClosing.set(false);
    }, 300);
  }

  protected openModalTasksDetailsFlag(currentTasksDetailsSelected: TasksDetailsFlag) {
    this.tasksDetailsFlag.set(currentTasksDetailsSelected);
  }

  protected closeTasksDetails(event: Event) {
    event.stopPropagation();

    this.isClosing.set(true);

    setTimeout(() => {
      this.tasksDetailsFlag.set(null);
      this.isClosing.set(false);
    }, 200);
  }

  protected totalTasks(): number {
    return this.taskService.totalTasks();
  }

  protected totalPendingTasks(): number {
    return this.taskService.totalPendingTasks();
  }

  protected totalInProgressTasks(): number {
    return this.taskService.totalInProgressTasks();
  }

  protected totalCompletedTasks(): number {
    return this.taskService.totalCompletedTasks();
  }

  protected completionRate(): number {
    return this.taskService.completionRate();
  }

  protected todaysTasks(): Task[] {
    return this.taskService.todaysTasks();
  }

  protected upcomingTasks(): Task[] {
    return this.taskService.upcomingTasks();
  }

  protected readonly isCreatingTask = signal<boolean>(false);
  protected readonly createTaskError = signal<string | null>(null);
  protected onTaskCreated(req: CreateTaskRequest): void {
    this.createTaskError.set(null); // clear previous error
    this.isCreatingTask.set(true);

    setTimeout(() => {
      this.taskService
        .createTask(req)
        .pipe(finalize(() => this.isCreatingTask.set(false)))
        .subscribe({
          next: () => this.closeModal(),
          error: (err) => {
            console.error('Failed to create task', err);
            this.createTaskError.set('Failed to create task. Please try again.');
          },
        });
    }, 5000);
  }

  protected readonly isUpdatingTaskStatus = signal<boolean>(false);
  protected readonly updateTaskStatusError = signal<string | null>(null);
  protected onTaskUpdatedStatus(targetTask: Task, taskStatusAction: TaskStatusAction): void {
    this.updateTaskStatusError.set(null);
    this.isUpdatingTaskStatus.set(true);

    this.taskService
      .updateTaskStatus(targetTask.id, taskStatusAction)
      .pipe(finalize(() => setTimeout(() => this.isUpdatingTaskStatus.set(false), 5000)))
      .subscribe({
        next: () => setTimeout(() => this.closeModal(), 5000),
        error: (err) => {
          console.error('Failed to update task status', err);
          this.updateTaskStatusError.set('Failed to update task status. Please try again.');
        },
      });
  }
}

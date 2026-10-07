import { Component, computed, inject, Signal, signal } from '@angular/core';
import { TaskService } from '../../core/services/task-service/task-service';
import { RouterLink } from '@angular/router';
import { Task } from '../../core/models/task';
import { TasksStatusCard } from './tasks-status-card/tasks-status-card';
import { LucideArrowRight, LucidePlus } from '@lucide/angular';
import { TasksStatusBadge } from '../../shared/components/tasks-status-badge/tasks-status-badge';
import { CreateTaskDialog } from '../../shared/components/dialog/create-task-dialog/create-task-dialog';
import { DatePipe } from '@angular/common';
import { TaskItem } from './task-item/task-item';
import { TaskEmptyState } from './task-empty-state/task-empty-state';
import { CreateTaskRequest } from '../../core/models/request/create-task-request';
import { finalize, map } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { TotalTasksDetailsModal } from './dialog/total-tasks-details-modal/total-tasks-details-modal';
import { PendingTasksDetailsModal } from './dialog/pending-tasks-details-modal/pending-tasks-details-modal';
import { InprogressTasksDetailsModal } from './dialog/inprogress-tasks-details-modal/inprogress-tasks-details-modal';
import { CompletedTasksDetailsModal } from './dialog/completed-tasks-details-modal/completed-tasks-details-modal';
import {
  TaskDetailsDialog,
  TaskStatusAction,
} from '../../shared/components/dialog/task-details-dialog/task-details-dialog';

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
  private readonly bp = inject(BreakpointObserver);
  protected readonly isMobile = toSignal(
    this.bp.observe(Breakpoints.Handset).pipe(map((r) => r.matches)),
    { initialValue: false },
  );
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
  protected onTaskCreated(req: CreateTaskRequest): void {
    this.isCreatingTask.set(true);

    this.taskService
      .createTask(req)
      .pipe(finalize(() => this.isCreatingTask.set(false)))
      .subscribe({
        next: () => this.closeModal(),
      });
  }

  protected readonly isUpdatingTaskStatus = signal<boolean>(false);
  protected onTaskUpdatedStatus(targetTask: Task, taskStatusAction: TaskStatusAction): void {
    this.isUpdatingTaskStatus.set(true);

    this.taskService
      .updateTaskStatus(targetTask.id, taskStatusAction)
      .pipe(finalize(() => this.isUpdatingTaskStatus.set(false)))
      .subscribe({
        next: () => this.closeModal(),
      });
  }
}

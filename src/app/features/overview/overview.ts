import { Component, effect, inject, Signal, signal, untracked } from '@angular/core';
import { TaskService } from '../../core/services/task-service/task-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Task } from '../../core/models/task';
import { TasksStatusCard } from './tasks-status-card/tasks-status-card';
import { LucideArrowRight, LucideCalendarDays, LucidePlus } from '@lucide/angular';
import { TasksStatusBadge } from '../../shared/components/tasks-status-badge/tasks-status-badge';
import { CreateTaskDialog } from '../../shared/components/dialog/create-task-dialog/create-task-dialog';
import { DatePipe } from '@angular/common';
import { TaskItem } from './task-item/task-item';
import { TaskEmptyState } from './task-empty-state/task-empty-state';
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
import { CreateTaskRequest } from '../../api';
import { NotificationService } from '../../core/services/notification-service/notification-service';

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
    LucideCalendarDays,
    
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
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // dialog state from the URL (?action=...&taskid=...), updated whenever the query params change
  private readonly modalQueryParams = toSignal(
    this.route.queryParamMap.pipe(
      map((q) => ({
        action: q.get('action'),
        taskId: Number(q.get('taskid')) || null,
      })),
    ),
    { initialValue: { action: null, taskId: null } },
  );

  constructor() {
    // opens the dialog from the URL's ?action= and ?taskId=
    effect(() => {
      const { action, taskId } = this.modalQueryParams();

      if (!action) {
        return;
      }

      if (action === 'create') {
        untracked(() => this.activeDialog.set({ type: 'create-task-dialog' }));
      }

      if (!taskId || this.tasks().length === 0) return; // tasks not loaded yet

      const task = this.tasks().find((t) => t.id === taskId);

      if (!task) {
        untracked(() => {
          this.appNotification.error('Task not found');
          this.clearQueryParams();
        });
        return;
      }

      if (action === 'view') {
        untracked(() => this.activeDialog.set({ type: 'task-details-dialog', selectedTask: task }));
      }
    });
  }

  // sets ?action= and ?taskid= in the URL
  private setQueryParams(action: 'view' | 'create', taskId?: number) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { action: action, taskid: taskId },
      queryParamsHandling: 'merge',
    });
  }

  // clears ?action= and ?taskid= from the URL
  private clearQueryParams() {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { action: null, taskid: null },
      queryParamsHandling: 'merge',
    });
  }

  // opens the create dialog and adds ?action=create to the URL
  protected onOpenCreateTaskDialog() {
    this.setQueryParams('create');
    this.activeDialog.set({ type: 'create-task-dialog' });
  }

  // opens the task-details-dialog for the clicked task and adds ?action=view&taskid=<id> to the URL
  protected onTaskClick(selectedTask: Task) {
    this.setQueryParams('view', selectedTask.id);
    this.activeDialog.set({ type: 'task-details-dialog', selectedTask: selectedTask });
  }

  // watches the screen size (Angular CDK)
  private readonly bp = inject(BreakpointObserver);
  protected readonly isMobile = toSignal(
    this.bp.observe(Breakpoints.Handset).pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  // loads and updates tasks through the API
  private readonly taskService = inject(TaskService);
  // shows success and error toast messages
  private readonly appNotification = inject(NotificationService);
  // all tasks from the service (read-only)
  protected readonly tasks: Signal<Task[]> = this.taskService.tasks;
  // the open dialog and the task it shows (defaults to { type: null, selectedTask: undefined }, no dialog open)
  protected readonly activeDialog = signal<{ type: ModalSelection; selectedTask?: Task }>({
    type: null,
    selectedTask: undefined,
  });
  // tracks which tasks details modal is open (null when none)
  protected readonly tasksDetailsFlag = signal<TasksDetailsFlag>(null);
  // tracks the dialog's closing animation
  protected readonly isClosing = signal(false);

  // closes the dialog after its closing animation
  protected closeModal() {
    if (this.isClosing()) {
      return;
    }

    this.clearQueryParams();

    this.isClosing.set(true);
    setTimeout(() => {
      this.activeDialog.set({ type: null });
      this.isClosing.set(false);
    }, 300);
  }

  // closes a stat card's details popup after its closing animation
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

  // limit to 5 the displayed today's Tasks
  protected todaysTasks(): Task[] {
    return this.taskService.todaysTasks().slice(0, 5);
  }

  protected upcomingTasks(): Task[] {
    return this.taskService.upcomingTasks();
  }

  // disables the Create Task Dialog's [Create] button while the request runs
  protected readonly isCreatingTask = signal<boolean>(false);
  // saves the new task
  protected onTaskCreated(req: CreateTaskRequest): void {
    this.isCreatingTask.set(true);

    this.taskService
      .createTask(req)
      .pipe(finalize(() => this.isCreatingTask.set(false)))
      .subscribe({
        next: () => this.closeModal(),
      });
  }

  // disables the Task Details Dialog's primary button while the request runs
  protected readonly isUpdatingTaskStatus = signal<boolean>(false);
  // saves the edited task status
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

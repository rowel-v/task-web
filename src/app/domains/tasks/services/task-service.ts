import { isPlatformBrowser } from '@angular/common';
import { computed, DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Task } from '../models/task';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { NotificationService } from '../../../core/services/notification-service/notification-service';
import { TaskStatusAction } from '../dialogs/task-details-dialog/task-details-dialog';
import {
  CreateTaskRequest,
  TaskControllerService,
  TaskResponse,
  UpdateTaskRequest,
  ApiResponseVoid,
} from '../../../api';
import { UserService } from '../../user/services/user-service';
import { TimeZoneService } from '../../../core/services/time-zone-service/time-zone-service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  // Refresh time-based lists while the app stays open.
  private readonly currentTime = signal(new Date());
  readonly now = this.currentTime.asReadonly();

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      const timer = setInterval(() => this.currentTime.set(new Date()), 60_000);
      inject(DestroyRef).onDestroy(() => clearInterval(timer));
    }
  }

  private readonly api = inject(TaskControllerService);
  private readonly baseUrl = '/api/tasks';

  private readonly http = inject(HttpClient);
  private readonly appNotification = inject(NotificationService);
  private readonly userService = inject(UserService);
  private readonly timeZones = inject(TimeZoneService);
  private readonly tasksState = signal<Task[]>([]);
  tasks = this.tasksState.asReadonly();
  totalTasks = computed(() => this.tasksState().length);
  totalPendingTasks = computed(
    () => this.tasksState().filter((t) => t.status === 'PENDING').length,
  );
  totalInProgressTasks = computed(
    () => this.tasksState().filter((t) => t.status === 'IN_PROGRESS').length,
  );
  totalCompletedTasks = computed(
    () => this.tasksState().filter((t) => t.status === 'COMPLETED').length,
  );

  readonly completionRate = computed(() => {
    const tasks = this.tasksState();
    if (tasks.length === 0) {
      return 0;
    }
    const completed = tasks.filter((task) => task.status === 'COMPLETED').length;
    return Math.round((completed / tasks.length) * 100);
  });

  readonly todaysTasks = computed(() => {
    const today = this.now();

    return this.tasksState().filter((task) => this.timeZones.isSameDay(task.dueDate, today));
  });

  readonly upcomingTasks = computed(() => {
    const now = this.now();
    return this.tasksState()
      .filter((task) => task.dueDate && new Date(task.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  });
  getAllTask(notifyOnError = true): Observable<Task[]> {
    return this.api.getTasks().pipe(
      tap((result) => {
        this.userService.setDisplayName(result.data?.displayName ?? undefined);
        this.timeZones.setTimeZone(result.data?.timeZone || null);
      }),
      map((result) => result.data?.tasks.map(this.toTask) ?? []),
      tap((tasks) => this.tasksState.set(tasks)),
      catchError((err: HttpErrorResponse) =>
        notifyOnError ? this.handleError(err) : throwError(() => err),
      ),
    );
  }

  clear(): void {
    this.tasksState.set([]);
    this.userService.setDisplayName(undefined);
    this.timeZones.setTimeZone(null);
  }

  createTask(req: CreateTaskRequest): Observable<Task> {
    return this.api.createTask(req).pipe(
      tap((result) => this.appNotification.success(result.message)),
      map((result) => this.toTask(result.data!)),
      tap((task) => this.tasksState.update((tasks) => [...tasks, task])),
      catchError((err: HttpErrorResponse) => this.handleError(err)),
    );
  }

  updateTask(taskId: number, req: UpdateTaskRequest): Observable<Task> {
    return this.api.updateTask(taskId, req).pipe(
      tap((result) => this.appNotification.success(result.message)),
      map((result) => this.toTask(result.data!)),
      tap((task) => {
        this.tasksState.update((tasks) => tasks.map((t) => (t.id === task.id ? task : t)));
      }),
      catchError((err: HttpErrorResponse) => this.handleError(err)),
    );
  }

  deleteTask(tasks: Task[]): Observable<void> {
    const taskIds: number[] = tasks.map((t) => t.id);

    return this.api.deleteTask(taskIds).pipe(
      tap((result) => {
        this.appNotification.success(result.message);
        this.tasksState.update((current) => current.filter((t) => !taskIds.includes(t.id)));
      }),
      catchError((err: HttpErrorResponse) => this.handleError(err)),
      map(() => undefined),
    );
  }

  updateTaskStatus(taskId: number, taskStatusAction: TaskStatusAction): Observable<Task> {
    return this.api.updateTaskStatus(taskId, taskStatusAction).pipe(
      tap((result) => this.appNotification.success(result.message)),
      map((result) => this.toTask(result.data!)),
      tap((task) => {
        this.tasksState.update((tasks) => tasks.map((t) => (t.id === task.id ? task : t)));
      }),
      catchError((err: HttpErrorResponse) => this.handleError(err)),
    );
  }

  reopenTask(taskId: number, changes: UpdateTaskRequest): Observable<Task> {
    return this.api.reopenTask(taskId, changes).pipe(
      tap((result) => this.appNotification.success(result.message)),
      map((result) => this.toTask(result.data!)),
      tap((task) =>
        this.tasksState.update((tasks) => tasks.map((t) => (t.id === task.id ? task : t))),
      ),
      catchError((err: HttpErrorResponse) => this.handleError(err)),
    );
  }

  archiveTask(tasks: Task[]): Observable<void> {
    const taskIds = tasks.map((t) => t.id);

    return this.api.archiveTask(taskIds).pipe(
      tap((result) => this.appNotification.success(result.message)),
      map((result) => result.data!.map((taskResponse) => this.toTask(taskResponse))),
      tap((tasksResult) => {
        this.tasksState.update((currentTasks) =>
          currentTasks.map((task) => tasksResult.find((updated) => updated.id === task.id) ?? task),
        );
      }),
      map(() => undefined),
      catchError((err: HttpErrorResponse) => this.handleError(err)),
    );
  }

  private readonly handleError = (err: HttpErrorResponse) => {
    if (err.status === 401) return throwError(() => err);
    const errorResponse = err.error as ApiResponseVoid | null;
    const errorMessage = errorResponse?.message ?? 'Something went wrong. Please try again.';
    this.appNotification.error(errorMessage);
    return throwError(() => err);
  };

  private readonly toTask = (taskResponse: TaskResponse): Task => ({
    id: taskResponse.id,
    name: taskResponse.name,
    description: taskResponse.description ?? null,
    status: taskResponse.status,
    priority: taskResponse.priority,
    createdAt: taskResponse.createdAt,
    updatedAt: taskResponse.updatedAt,
    dueDate: taskResponse.dueDate,
    completedAt: taskResponse.completedAt ?? null,
    archive: taskResponse.archived ?? false,
    archiveAt: taskResponse.archivedAt ?? null,
  });
}

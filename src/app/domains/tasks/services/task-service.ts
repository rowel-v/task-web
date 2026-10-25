import { computed, inject, Injectable, signal } from '@angular/core';
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

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly api = inject(TaskControllerService);
  private readonly baseUrl = '/api/tasks';

  private readonly http = inject(HttpClient);
  private readonly appNotification = inject(NotificationService);
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
    const today = new Date();

    return this.tasksState().filter((task) => {
      const dueDate = new Date(task.dueDate);

      return (
        dueDate.getFullYear() === today.getFullYear() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getDate() === today.getDate()
      );
    });
  });

  readonly upcomingTasks = computed(() => {
    const now = new Date();
    return this.tasksState()
      .filter((task) => task.dueDate && new Date(task.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  });
  getAllTask(): Observable<Task[]> {
    return this.api.getTasks().pipe(
      map((result) => result.data?.tasks.map(this.toTask) ?? []),
      tap((tasks) => this.tasksState.set(tasks)),
      catchError((err: HttpErrorResponse) => this.handleError(err)),
    );
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

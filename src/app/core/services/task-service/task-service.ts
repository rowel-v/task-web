import { computed, inject, Injectable, signal } from '@angular/core';
import { Task } from '../../../shared/models/task';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { ApiResponse } from '../../../shared/models/response/api-response';
import { CreateTaskRequest } from '../../../shared/models/request/create-task-request';
import { UpdateTaskRequest } from '../../../shared/models/request/update-task-request';
import { TaskStatusAction } from '../../../shared/components/dialog/task-details-dialog/task-details-dialog';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly baseUrl = '/api/tasks';
  private readonly http = inject(HttpClient);
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
    return this.http.get<ApiResponse<Task[]>>(this.baseUrl).pipe(
      tap((result) => this.tasksState.set(result.data)),
      map((result) => result.data),
    );
  }

  getTask(taskId: number): Observable<Task> {
    return this.http
      .get<ApiResponse<Task>>(`${this.baseUrl}/${taskId}`)
      .pipe(map((result) => result.data));
  }

  createTask(req: CreateTaskRequest): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(`${this.baseUrl}`, req).pipe(
      tap((result) => this.tasksState.update((tasks) => [...tasks, result.data])),
      map((result) => result.data),
    );
  }

  updateTask(taskId: number, req: UpdateTaskRequest): Observable<Task> {
    return this.http.patch<ApiResponse<Task>>(`${this.baseUrl}/${taskId}`, req).pipe(
      tap((result) =>
        this.tasksState.update((tasks) =>
          tasks.map((task) => (task.id === result.data.id ? result.data : task)),
        ),
      ),
      map((result) => result.data),
    );
  }

  deleteTask(task: Task[]): Observable<void> {
    const taskIds = task.map((t) => t.id);
    const ids = new Set(taskIds);

    return this.http.delete<void>(`${this.baseUrl}`, { body: { taskIds } }).pipe(
      tap(() => this.tasksState.update((current) => current.filter((t) => !ids.has(t.id)))),
    );
  }

  updateTaskStatus(taskId: number, taskStatusAction: TaskStatusAction): Observable<Task> {
    return this.http
      .patch<ApiResponse<Task>>(`${this.baseUrl}/${taskId}/${taskStatusAction}`, null)
      .pipe(
        tap((result) =>
          this.tasksState.update((task) =>
            task.map((t) => (t.id === result.data.id ? result.data : t)),
          ),
        ),
        map((result) => result.data),
      );
  }
}

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
    return this.http.get<ApiResponse<Task[]>>('http://localhost:8080/tasks').pipe(
      tap((result) => this.tasksState.set(result.data)),
      map((result) => result.data),
    );
  }

  getTask(taskId: number): Observable<Task> {
    return this.http
      .get<ApiResponse<Task>>(`http://localhost:8080/tasks/${taskId}`)
      .pipe(map((result) => result.data));
  }

  createTask(req: CreateTaskRequest): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(`http://localhost:8080/tasks`, req).pipe(
      tap((result) => this.tasksState.update((tasks) => [...tasks, result.data])),
      map((result) => result.data),
    );
  }

  updateTask(taskId: number, req: UpdateTaskRequest): Observable<Task> {
    return this.http.patch<ApiResponse<Task>>(`http://localhost:8080/tasks/${taskId}`, req).pipe(
      tap((result) =>
        this.tasksState.update((tasks) =>
          tasks.map((task) => (task.id === result.data.id ? result.data : task)),
        ),
      ),
      map((result) => result.data),
    );
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http
      .delete<void>(`http://localhost:8080/tasks/${taskId}`)
      .pipe(tap(() => this.tasksState.update((tasks) => tasks.filter((t) => t.id !== taskId))));
  }

  updateTaskStatus(taskId: number, taskStatusAction: TaskStatusAction): Observable<Task> {
    return this.http
      .patch<ApiResponse<Task>>(`http://localhost:8080/tasks/${taskId}/${taskStatusAction}`, null)
      .pipe(
        tap((result) =>
          this.tasksState.update((task) =>
            task.map((t) => (t.id === result.data.id ? result.data : t)),
          ),
        ),
        map((result) => result.data),
      );
  }

  // addTodo(todo: Todo) {
  //   this.todosState.update((todos) => [
  //     ...todos,
  //     {
  //       ...todo,
  //       id: this.defaultId++,
  //     },
  //   ]);
  // }

  // updateStatus(todo: Todo, status: TodoStatus) {
  //   this.todosState.update((todos) => todos.map((t) => (t.id === todo.id ? { ...t, status } : t)));
  // }

  // deleteTodo(todo: Todo) {
  //   this.todosState.update((todos) => todos.filter((t) => t.id !== todo.id));
  // }

  // updateTodo(todo: Todo) {
  //   this.todosState.update((todos) =>
  //     todos.map((t) =>
  //       t.id === todo.id
  //         ? {
  //             ...t,
  //             name: todo.name,
  //             description: todo.description,
  //             priority: todo.priority,
  //             status: todo.status,
  //             duedate: todo.duedate,
  //             updatedAt: new Date(),
  //           }
  //         : t,
  //     ),
  //   );
  // }
}

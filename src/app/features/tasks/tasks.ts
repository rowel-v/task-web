import { Component, computed, inject, OnInit, Signal, signal } from '@angular/core';
import { TaskService } from '../../core/services/task-service/task-service';
import { Task } from '../../shared/models/task';
import { CommonModule } from '@angular/common';
import { TasksStatusBadge } from '../../shared/components/tasks-status-badge/tasks-status-badge';
import { TaskDetailsDialog } from '../../shared/components/dialog/task-details-dialog/task-details-dialog';
import { SearchService } from '../../core/services/search-service/search-service';
import { CreateTaskDialog } from '../../shared/components/dialog/create-task-dialog/create-task-dialog';
import { CreateTaskRequest } from '../../shared/models/request/create-task-request';
import { DeleteTaskDialog } from '../../shared/components/dialog/delete-task-dialog/delete-task-dialog';
import { finalize } from 'rxjs';
import {
  LucideClipboardList,
  LucideClock5,
  LucideCircleEllipsis,
  LucideCircleCheck,
  LucidePlus,
  LucideTrash,
  LucideSquarePen,
} from '@lucide/angular';
import { UpdateTaskRequest } from '../../shared/models/request/update-task-request';
import { EditTaskDialog } from '../../shared/components/dialog/edit-task-dialog/edit-task-dialog';

type TabSelection = 'all' | 'pending' | 'in_progress' | 'completed';
type ModalSelection =
  'task-details-dialog' | 'create-task-dialog' | 'edit-task-dialog' | 'delete-task-dialog' | null;

@Component({
  selector: 'app-tasks',
  imports: [
    LucideClipboardList,
    LucideClock5,
    LucideCircleEllipsis,
    LucideCircleCheck,
    LucidePlus,
    LucideTrash,
    LucideSquarePen,
    CommonModule,

    TasksStatusBadge,
    TaskDetailsDialog,
    CreateTaskDialog,
    DeleteTaskDialog,
    EditTaskDialog,
  ],
  templateUrl: './tasks.html',
  styles: ``,
})
export class Tasks implements OnInit {
  ngOnInit(): void {
    this.taskService.getAllTask().subscribe();
  }
  private readonly taskService = inject(TaskService);
  private readonly searchService = inject(SearchService);
  protected readonly selectedTab = signal<TabSelection>('all');
  protected readonly selectedTask = signal<Task | null>(null); // use for manage task
  protected readonly selectedModal = signal<ModalSelection>(null);
  private readonly tasks: Signal<Task[]> = this.taskService.tasks;
  protected readonly tasksToDisplay = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase().trim();

    let filtered: Task[] = [];
    switch (this.selectedTab()) {
      case 'all':
        filtered = this.tasks();
        break;
      case 'pending':
        filtered = this.tasks().filter((t) => t.status === 'PENDING');
        break;
      case 'in_progress':
        filtered = this.tasks().filter((t) => t.status === 'IN_PROGRESS');
        break;
      case 'completed':
        filtered = this.tasks().filter((t) => t.status === 'COMPLETED');
        break;
    }

    if (!term) {
      return filtered;
    }

    return filtered.filter(
      (t) => t.name.toLowerCase().includes(term) || t.description?.toLowerCase().includes(term),
    );
  });

  protected closedModal = signal<boolean>(false); // for rendering animation
  protected closeModal() {
    if (this.closedModal()) {
      return;
    }
    this.closedModal.set(true);
    setTimeout(() => {
      this.selectedModal.set(null);
      this.selectedTask.set(null);
      this.closedModal.set(false);
    }, 200);
  }

  protected readonly emptyState = computed(() => {
    const term = this.searchService.searchTerm().trim();
    const hasResults = this.tasksToDisplay().length > 0;

    if (term && !hasResults) {
      return {
        message: `No task found for "${term}".`,
        image: 'images/stick-man-empty-task-search.png',
        imageWidth: 'w-96',
      };
    }

    switch (this.selectedTab()) {
      case 'all':
        return {
          message: "You don't have any tasks yet.",
          image: 'images/stick-man-empty-all-tasks.png',
          imageWidth: 'w-35',
        };
      case 'pending':
        return {
          message: "No pending tasks. You're all caught up!",
          image: 'images/stick-man-empty-pending-tasks.png',
          imageWidth: 'w-35',
        };
      case 'in_progress':
        return {
          message: 'Nothing in progress right now.',
          image: 'images/stick-man-empty-in-progress-tasks.png',
          imageWidth: 'w-30',
        };
      case 'completed':
        return {
          message: 'No completed tasks yet.',
          image: 'images/stick-man-empty-completed-tasks.png',
          imageWidth: 'w-35',
        };
    }
  });

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

  protected readonly isDeletingTask = signal<boolean>(false);
  protected readonly deleteTaskError = signal<string | null>(null);
  protected onTaskDeleted(task: Task): void {
    this.deleteTaskError.set(null);
    this.isDeletingTask.set(true);

    this.taskService
      .deleteTask(task.id)
      .pipe(finalize(() => this.isDeletingTask.set(false)))
      .subscribe({
        next: () => this.closeModal(),
        error: (err) => {
          console.error('Failed to delete task', err);
          this.deleteTaskError.set('Failed to delete task. Please try again.');
        },
      });
  }

  protected readonly isUpdatingTask = signal<boolean>(false);
  protected readonly updateTaskError = signal<string | null>(null);
  protected onTaskUpdated(taskId: number, req: UpdateTaskRequest): void {
    this.updateTaskError.set(null);
    this.isUpdatingTask.set(true);

    console.log("Emitted Value: ", req);

    this.taskService
      .updateTask(taskId, req)
      .pipe(finalize(() => this.isUpdatingTask.set(false)))
      .subscribe({
        next: () => this.closeModal(),
        error: (err) => {
          console.error('Failed to delete task', err);
          this.updateTaskError.set('Failed to delete task. Please try again.');
        },
      });
  }
}

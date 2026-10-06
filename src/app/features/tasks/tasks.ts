import { TaskService } from '../../core/services/task-service/task-service';
import { Task } from '../../shared/models/task';
import { CommonModule } from '@angular/common';
import { TasksStatusBadge } from '../../shared/components/tasks-status-badge/tasks-status-badge';
import { SearchService } from '../../core/services/search-service/search-service';
import { CreateTaskDialog } from '../../shared/components/dialog/create-task-dialog/create-task-dialog';
import { CreateTaskRequest } from '../../shared/models/request/create-task-request';
import { DeleteTaskDialog } from '../../shared/components/dialog/delete-task-dialog/delete-task-dialog';
import { finalize, map } from 'rxjs';
import { UpdateTaskRequest } from '../../shared/models/request/update-task-request';
import { EditTaskDialog } from '../../shared/components/dialog/edit-task-dialog/edit-task-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  TaskDetailsDialog,
  TaskStatusAction,
} from '../../shared/components/dialog/task-details-dialog/task-details-dialog';
import {
  Component,
  computed,
  effect,
  inject,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import {
  LucideClipboardList,
  LucideClock5,
  LucideCircleEllipsis,
  LucideCircleCheck,
  LucidePlus,
  LucideTrash,
  LucidePencil,
} from '@lucide/angular';
import { HttpErrorResponse } from '@angular/common/http';

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
    LucidePencil,
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
export class Tasks {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskId = toSignal(
    this.route.queryParamMap.pipe(map((p) => Number(p.get('taskId')) || null)),
  );

  constructor() {
    // Opens the details dialog when arriving with a taskId in the URL.
    effect(() => {
      const id = this.taskId();
      const task = this.tasks().find((t) => t.id === id);
      if (!id || !task) return;

      untracked(() => {
        this.selectedTask.set(task);
        this.selectedModal.set('task-details-dialog');
      });
    });
  }

  private readonly taskService = inject(TaskService);
  private readonly searchService = inject(SearchService);
  protected readonly selectedTab = signal<TabSelection>('all');
  protected readonly selectedTask = signal<Task | null>(null); // use for manage task
  protected readonly selectedModal = signal<ModalSelection>(null);
  protected readonly tasks: Signal<Task[]> = this.taskService.tasks;
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

    this.updateTaskStatusError.set(null);
    this.updateTaskError.set(null);
    this.deleteTaskError.set(null);
    this.createTaskError.set(null);

    // Clear the taskId param when the dialog closes.
    if (this.taskId()) {
      void this.router.navigate([], {
        queryParams: { taskId: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
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

  // helper function
  protected readonly isOverdue = (task: Task) => {
    return task.status !== 'COMPLETED' && new Date(task.dueDate) < new Date();
  };

  // Watches the screen size (CDK). Handset = phones only.
  private readonly bp = inject(BreakpointObserver);
  protected readonly isMobile = toSignal(
    this.bp.observe(Breakpoints.Handset).pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  // true while the "Select" checkbox is on
  protected readonly selectMode = signal(false);
  protected onSelectToggle(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectMode.set(checked);
    // unchecking clears all selected tasks
    if (!checked) this.selectedTaskIds.set(new Set());
  }

  // ids of the tasks the user picked while selectMode is true
  protected readonly selectedTaskIds = signal<Set<number>>(new Set());

  // first selected task, used for Edit.
  protected readonly firstSelectedTask = computed<Task>(() => {
    const task = this.tasks().find((t) => this.selectedTaskIds().has(t.id));
    if (!task) throw new Error('No task is selected');
    return task;
  });

  // all selected tasks, used for bulk delete.
  protected readonly tasksToDelete: Signal<Task[]> = computed(() =>
    this.tasks().filter((t) => this.selectedTaskIds().has(t.id)),
  );

  // runs when a task row is clicked
  protected onTaskClick(modal: ModalSelection, task: Task) {
    // in select mode, clicking a row toggles its selection
    if (this.selectMode()) {
      this.selectedTaskIds.update((ids) => {
        // copy the Set so the signal sees a new value
        const next = new Set(ids);
        if (next.has(task.id)) {
          next.delete(task.id); // already selected, so unselect
        } else {
          next.add(task.id); // not selected, so select
        }
        return next;
      });
      return; // don't open the task-details-kdialog while selectMode is true
    }

    this.selectedModal.set(modal);
    this.selectedTask.set(task);
  }

  // used by the template to highlight selected rows
  protected isSelected(task: Task): boolean {
    return this.selectedTaskIds().has(task.id);
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

  protected readonly isDeletingTask = signal<boolean>(false);
  protected readonly deleteTaskError = signal<string | null>(null);
  protected onTaskDeleted(tasks: Task[]): void {
    this.deleteTaskError.set(null);
    this.isDeletingTask.set(true);

    this.taskService
      .deleteTask(tasks)
      .pipe(finalize(() => this.isDeletingTask.set(false)))
      .subscribe({
        next: () => {
          this.closeModal();
          this.selectMode.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.deleteTaskError.set(err.error?.message ?? 'Something went wrong. Please try again.');
        },
      });
  }

  protected readonly isUpdatingTask = signal<boolean>(false);
  protected readonly updateTaskError = signal<string | null>(null);
  protected onTaskUpdated(taskId: number, req: UpdateTaskRequest): void {
    this.updateTaskError.set(null);
    this.isUpdatingTask.set(true);

    console.log('Emitted Value: ', req);

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

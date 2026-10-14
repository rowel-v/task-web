import { TaskService } from '../../core/services/task-service/task-service';
import { Task } from '../../core/models/task';
import { CommonModule } from '@angular/common';
import { TasksStatusBadge } from '../../shared/components/tasks-status-badge/tasks-status-badge';
import { SearchService } from '../../core/services/search-service/search-service';
import { CreateTaskDialog } from '../../shared/components/dialog/create-task-dialog/create-task-dialog';
import { finalize, map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  TaskDetailsDialog,
  TaskStatusChangeRequest,
} from '../../shared/components/dialog/task-details-dialog/task-details-dialog';
import {
  Component,
  computed,
  DestroyRef,
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
  LucideArrowDownWideNarrow,
  LucideCalendarX,
  LucideSun,
} from '@lucide/angular';
import { LongPress } from './directives/long-press';
import { DeleteTaskDialog } from '../../shared/components/dialog/delete-task-dialog/delete-task-dialog';
import { EditTaskDialog } from '../../shared/components/dialog/edit-task-dialog/edit-task-dialog';
import { CreateTaskRequest, UpdateTaskRequest } from '../../api';
import {
  ReopenTaskDialog,
  ReopenTaskEvent,
} from '../../shared/components/dialog/reopen-task-dialog/reopen-task-dialog';
import { SelectModeService } from '../../core/services/select-mode-service/select-mode-service';

type TabSelection = 'all' | 'pending' | 'in_progress' | 'completed' | 'overdue' | 'today';
type SortSelection =
  'due-asc' | 'due-desc' | 'priority-high' | 'name-asc' | 'name-desc' | 'created';

type ModalSelection =
  | 'task-details-dialog'
  | 'create-task-dialog'
  | 'edit-task-dialog'
  | 'delete-task-dialog'
  | 'reopen-task-dialog'
  | null;

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
    LucideArrowDownWideNarrow,
    LucideCalendarX,
    LucideSun,
    CommonModule,
    LongPress,

    TasksStatusBadge,
    TaskDetailsDialog,
    CreateTaskDialog,
    DeleteTaskDialog,
    EditTaskDialog,
    ReopenTaskDialog,
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

    // clear picked tasks whenever select mode is turned off by selectModeService
    effect(() => {
      if (!this.selectMode()) {
        this.selectedTaskIds.set(new Set());
      }
    });

    // turn select mode off when leaving the Tasks page
    inject(DestroyRef).onDestroy(() => this.selectModeService.toggleOff());
  }

  private readonly taskService = inject(TaskService);
  private readonly searchService = inject(SearchService);
  private readonly selectModeService = inject(SelectModeService);
  protected readonly selectedTab = signal<TabSelection>('all');
  protected readonly selectedTask = signal<Task | null>(null); // use for manage task
  protected readonly selectedModal = signal<ModalSelection>(null);
  protected readonly tasks: Signal<Task[]> = this.taskService.tasks;
  protected readonly sortBy = signal<SortSelection>('due-asc');
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
      case 'overdue':
        filtered = this.tasks().filter((t) => this.isOverdue(t));
        break;
      case 'today': {
        const now = new Date();

        filtered = this.tasks().filter(
          (t) =>
            t.status !== 'COMPLETED' &&
            t.dueDate &&
            new Date(t.dueDate).toDateString() === now.toDateString(),
        );
        break;
      }
    }

    const result = term
      ? filtered.filter(
          (t) => t.name.toLowerCase().includes(term) || t.description?.toLowerCase().includes(term),
        )
      : filtered;

    return this.sortTasks(result);
  });

  private sortTasks(list: Task[]): Task[] {
    const due = (t: Task) => (t.dueDate ? new Date(t.dueDate).getTime() : Infinity);
    const priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };

    return [...list].sort((a, b) => {
      switch (this.sortBy()) {
        case 'due-asc':
          return due(a) - due(b);
        case 'due-desc':
          return due(b) - due(a);
        case 'priority-high':
          return priorityRank[a.priority] - priorityRank[b.priority] || due(a) - due(b);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }

  protected closedModal = signal<boolean>(false); // for rendering animation
  protected closeModal() {
    if (this.closedModal()) {
      return;
    }

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
      case 'overdue':
        return {
          message: 'No overdue tasks.',
          image: 'images/stick-man-empty-overdue-tasks.png',
          imageWidth: 'w-30',
        };
      case 'today':
        return {
          message: 'No tasks due today.',
          image: 'images/stick-man-empty-today-tasks.png',
          imageWidth: 'w-40',
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

  // mirrors the header's "Select Mode" toggle (shared through SelectModeService
  protected readonly selectMode = this.selectModeService.enabled;
  protected exitSelectMode() {
    this.selectModeService.toggleOff(); // the effect clears selectedTaskIds
    this.selectedTaskIds.set(new Set());
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

      if (this.selectedTaskIds().size === 0) {
        this.exitSelectMode();
      }

      return; // don't open the task-details-kdialog while selectMode is true
    }

    this.selectedModal.set(modal);
    this.selectedTask.set(task);
  }

  // used by the template to highlight selected rows
  protected isSelected(task: Task): boolean {
    return this.selectedTaskIds().has(task.id);
  }

  protected onTaskLongPress(task: Task) {
    if (this.selectMode()) {
      return;
    }

    this.selectModeService.toggleOn();
    this.onTaskClick(null, task);
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

  protected readonly isDeletingTask = signal<boolean>(false);
  protected onTaskDeleted(tasks: Task[]): void {
    this.isDeletingTask.set(true);

    this.taskService
      .deleteTask(tasks)
      .pipe(finalize(() => this.isDeletingTask.set(false)))
      .subscribe({
        next: () => {
          this.closeModal();
          this.exitSelectMode();
        },
      });
  }

  protected readonly isUpdatingTask = signal<boolean>(false);
  protected onTaskUpdated(taskId: number, req: UpdateTaskRequest): void {
    this.isUpdatingTask.set(true);

    this.taskService
      .updateTask(taskId, req)
      .pipe(finalize(() => this.isUpdatingTask.set(false)))
      .subscribe({
        next: () => this.closeModal(),
      });
  }

  protected readonly isUpdatingTaskStatus = signal<boolean>(false);
  protected onTaskUpdatedStatus(taskStatusChangeReq: TaskStatusChangeRequest): void {
    const req = taskStatusChangeReq;

    // if request is REOPEN not START nor COMPLETE, transfer the request in reopen-task-dialog
    if (req.reopen) {
      this.selectedModal.set('reopen-task-dialog');
      this.selectedTask.set(req.targetTask);
      return;
    }

    this.isUpdatingTaskStatus.set(true);

    this.taskService
      .updateTaskStatus(req.targetTask.id, req.action)
      .pipe(finalize(() => this.isUpdatingTaskStatus.set(false)))
      .subscribe({
        next: () => this.closeModal(),
      });
  }

  protected readonly isReopeningTask = signal<boolean>(false);
  protected onTaskReopen(event: ReopenTaskEvent): void {
    this.isReopeningTask.set(true);

    this.taskService
      .reopenTask(event.id, event.changes)
      .pipe(finalize(() => this.isReopeningTask.set(false)))
      .subscribe({ next: () => this.closeModal() });
  }
}

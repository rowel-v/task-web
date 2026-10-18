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
import { NotificationService } from '../../core/services/notification-service/notification-service';

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

      if (!action) return;

      if (action === 'create') {
        untracked(() => this.activeDialog.set({ type: 'create-task-dialog' }));
        return;
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

      if (action === 'edit') {
        untracked(() => this.activeDialog.set({ type: 'edit-task-dialog', selectedTask: task }));
      } else if (action === 'view') {
        untracked(() => this.activeDialog.set({ type: 'task-details-dialog', selectedTask: task }));
      } else if (action === 'reopen') {
        untracked(() => this.activeDialog.set({ type: 'reopen-task-dialog', selectedTask: task }));
      }
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

  // sets ?action= and ?taskid= in the URL
  private setQueryParams(action: 'view' | 'create' | 'edit' | 'reopen', taskId?: number) {
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

  // loads and updates tasks through the API
  private readonly taskService = inject(TaskService);
  // shared search term typed in the header's search box
  private readonly searchService = inject(SearchService);
  // shows success and error toast messages
  private readonly appNotification = inject(NotificationService);
  // shared select mode state, toggled from the header
  private readonly selectModeService = inject(SelectModeService);

  // all tasks from the service (read-only)
  protected readonly tasks: Signal<Task[]> = this.taskService.tasks;
  // active tab
  protected readonly selectedTab: Signal<TabSelection> = toSignal(
    this.route.paramMap.pipe(
      map((p) => (p.get('tab')?.replace('-', '_') ?? '') as TabSelection),
      map((tab) => {
        const validTabs: TabSelection[] = [
          'all',
          'pending',
          'in_progress',
          'completed',
          'overdue',
          'today',
        ];
        return validTabs.includes(tab) ? tab : 'all';
      }),
    ),
    { initialValue: 'all' },
  );

  // switches tab by changing the URL, and selectedTab updates from it ('completed' -> /tasks/completed)
  protected selectTab(tab: TabSelection): void {
    void this.router.navigate(['tasks', tab.replace('_', '-')]);
  }

  // the open dialog and the task it shows (defaults to { type: null, selectedTask: null }, no dialog open)
  protected readonly activeDialog = signal<{ type: ModalSelection; selectedTask?: Task }>({
    type: null,
    selectedTask: undefined,
  });

  protected onOpenEditTaskDialog(selectedTask: Task) {
    this.setQueryParams('edit', selectedTask.id);
    this.activeDialog.set({ type: 'edit-task-dialog', selectedTask: selectedTask });
  }

  protected onOpenDeleteTaskDialog() {
    // selectedTask stays null: the tasks to delete come from tasksToDelete (the picked rows), not from a single task
    this.activeDialog.set({ type: 'delete-task-dialog' });
  }

  protected onOpenCreateTaskDialog() {
    this.setQueryParams('create');
    this.activeDialog.set({ type: 'create-task-dialog' });
  }

  // current order chosen in the sort dropdown
  protected readonly sortBy = signal<SortSelection>('due-asc');

  // tasks shown in the list: filtered by tab, then by search term, then sorted
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

  // message and image shown when the tasks list is empty, based on the search term or active tab
  protected readonly emptyState = computed(() => {
    const term = this.searchService.searchTerm().trim();
    const hasResults = this.tasksToDisplay().length > 0;

    // a search with no matches gets its own message
    if (term && !hasResults) {
      return {
        message: `No task found for "${term}".`,
        image: 'images/stick-man-empty-task-search.png',
        imageWidth: 'w-96',
      };
    }

    // otherwise the message depends on the active tab
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

  protected closedModal = signal<boolean>(false); // for rendering animation
  protected closeModal() {
    if (this.closedModal()) {
      return;
    }

    // Clear the query params when the dialog closes.
    this.clearQueryParams();

    this.closedModal.set(true);

    setTimeout(() => {
      this.activeDialog.set({ type: null });
      this.closedModal.set(false);
    }, 200);
  }

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

  // ids of the tasks picked while selectMode is true
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
  protected onTaskClick(selectedTask: Task) {
    // in select mode, clicking a row toggles its selection
    if (this.selectMode()) {
      this.selectedTaskIds.update((ids) => {
        // copy the Set so the signal sees a new value
        const next = new Set(ids);
        if (next.has(selectedTask.id)) {
          next.delete(selectedTask.id); // already selected, so unselect
        } else {
          next.add(selectedTask.id); // not selected, so select
        }
        return next;
      });

      if (this.selectedTaskIds().size === 0) {
        this.exitSelectMode();
      }

      return; // don't open the task-details-kdialog while selectMode is true
    }

    this.setQueryParams('view', selectedTask.id);
    this.activeDialog.set({ type: 'task-details-dialog', selectedTask: selectedTask });
  }

  // used by the template to highlight selected rows
  protected isSelected(task: Task): boolean {
    return this.selectedTaskIds().has(task.id);
  }

  // long press (mobile) turns on select mode and selects the pressed task
  protected onTaskLongPress(task: Task) {
    // the press is handled as a normal click if already in select mode
    if (this.selectMode()) {
      return;
    }

    this.selectModeService.toggleOn();
    this.onTaskClick(task);
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

  // disables the Delete Task Dialog's [Delete] button while the request runs
  protected readonly isDeletingTask = signal<boolean>(false);
  // deletes the tasks, then closes the dialog and exits select mode
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

  // disables the Edit Task Dialog's [Save] button while the request runs
  protected readonly isUpdatingTask = signal<boolean>(false);
  // saves the edited task
  protected onTaskUpdated(taskId: number, req: UpdateTaskRequest): void {
    this.isUpdatingTask.set(true);

    this.taskService
      .updateTask(taskId, req)
      .pipe(finalize(() => this.isUpdatingTask.set(false)))
      .subscribe({
        next: (updatedTask) => {
          this.selectModeService.toggleOff();
          this.setQueryParams('view', updatedTask.id);
          // show the updated task in the details dialog (replaces the edit dialog)
          this.activeDialog.set({ type: 'task-details-dialog', selectedTask: updatedTask });
        },
      });
  }

  // disables the Task Details Dialog's primary button while the request runs
  protected readonly isUpdatingTaskStatus = signal<boolean>(false);
  // saves the edited task status
  protected onTaskUpdatedStatus(taskStatusChangeReq: TaskStatusChangeRequest): void {
    const req = taskStatusChangeReq;

    // if request is REOPEN not START nor COMPLETE, transfer the request in reopen-task-dialog
    if (req.reopen) {
      this.setQueryParams('reopen', req.targetTask.id);
      this.activeDialog.set({ type: 'reopen-task-dialog', selectedTask: req.targetTask });
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

  // disables the Reopen Task dialog's [Save] button while the request runs
  protected readonly isReopeningTask = signal<boolean>(false);
  // saves the reopen task request
  protected onTaskReopen(event: ReopenTaskEvent): void {
    this.isReopeningTask.set(true);

    this.taskService
      .reopenTask(event.id, event.changes)
      .pipe(finalize(() => this.isReopeningTask.set(false)))
      .subscribe({
        next: (updatedTask) => {
          this.setQueryParams('view', updatedTask.id);
          // show the updated reopened task in the details dialog (replaces the edit dialog)
          this.activeDialog.set({ type: 'task-details-dialog', selectedTask: updatedTask });
        },
      });
  }
}

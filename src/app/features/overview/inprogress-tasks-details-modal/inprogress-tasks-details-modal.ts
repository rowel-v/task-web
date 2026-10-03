import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Task } from '../../../shared/models/task';
import { TaskDetailsList } from '../../../shared/components/task-details-list/task-details-list';
import {
  LucideX,
  LucideArrowLeft,
  LucideCircleEllipsis,
  LucideFlagTriangleRight,
  LucideAlarmClock,
  LucideTriangleAlert,
} from '@lucide/angular';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

type TaskCategory = 'in_progress' | 'high_priority' | 'due_today' | 'overdue' | null;

@Component({
  selector: 'app-inprogress-tasks-details-modal',
  imports: [
    TaskDetailsList,
    LucideX,
    LucideArrowLeft,
    LucideCircleEllipsis,
    LucideFlagTriangleRight,
    LucideAlarmClock,
    LucideTriangleAlert,
  ],
  templateUrl: './inprogress-tasks-details-modal.html',
  styles: ``,
})
export class InprogressTasksDetailsModal {
  private readonly bp = inject(BreakpointObserver);
  protected readonly isMobile = toSignal(
    this.bp.observe(Breakpoints.Handset).pipe(map((r) => r.matches)),

    { initialValue: false },
  );
  private readonly backDrop = viewChild<ElementRef<HTMLElement>>('backDrop'); // control backdrop closing
  private readonly backBtn = viewChild<ElementRef<HTMLButtonElement>>('backBtn');
  constructor() {
    // Focus the back button whenever it appears.
    effect(() => {
      this.backBtn()?.nativeElement.focus();
    });
  }

  tasks = input.required<Task[]>(); // Input tasks from the parent component.
  protected inProgressTasks = computed(() =>
    this.tasks().filter((t) => t.status === 'IN_PROGRESS'),
  );
  // Gets in-progress tasks with high priority.
  protected inProgressHighPriority = computed(() =>
    this.inProgressTasks().filter((t) => t.priority === 'HIGH'),
  );
  // Gets in-progress tasks that are due today.
  protected inProgressDueToday = computed(() => {
    const today = new Date().toDateString();
    return this.inProgressTasks().filter((t) => {
      return new Date(t.dueDate).toDateString() === today;
    });
  });
  // Gets tasks that are not completed and past their due date.
  protected overdueTasks = computed(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return this.tasks()
      .filter((t) => t.status !== 'COMPLETED')
      .filter((t) => new Date(t.dueDate) < startOfDay);
  });

  // Category rows displayed in the task breakdown.
  // prettier-ignore
  protected categories = computed(() => [
    { key: 'in_progress', label: 'In Progress', count: this.inProgressTasks().length },
    { key: 'high_priority', label: 'High Priority', count: this.inProgressHighPriority().length },
    { key: 'due_today', label: 'Due Today', count: this.inProgressDueToday().length },
    { key: 'overdue', label: 'Overdue', count: this.overdueTasks().length },
  ] as const);

  closed = output<void>(); // used to notify the parent when the modal is closed.
  protected isClosing = signal(false); // Controls the modal closing animation.
  protected isReturning = signal(false); // for animation when returning to the task breakdown.
  protected selectedCategory = signal<TaskCategory>(null); // Stores the currently selected task category.
  // Updates the selected category and determines the navigation animation.
  protected selectCategory(taskCategory: TaskCategory) {
    // Animate from left when returning to the task breakdown.
    this.isReturning.set(this.selectedCategory() !== null && taskCategory === null);
    this.selectedCategory.set(taskCategory);
  }

  // Starts the modal closing animation before notifying the parent.
  protected closeModal() {
    if (this.isClosing()) return;

    this.isClosing.set(true);

    setTimeout(() => {
      this.closed.emit();
      this.isClosing.set(false);
    }, 200);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent) {
    if (event.target === this.backDrop()?.nativeElement) this.closeModal();
  }

  @HostListener('document:keydown.escape')
  protected onEscape() {
    this.closeModal();
  }
}

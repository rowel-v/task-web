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
  LucideClock5,
  LucideFlagTriangleRight,
  LucideAlarmClock,
  LucideTriangleAlert,
  LucideArrowLeft,
  LucideX,
} from '@lucide/angular';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

type TaskCategory = 'pending' | 'high_priority' | 'due_today' | 'overdue' | null;

@Component({
  selector: 'app-pending-tasks-details-modal',
  imports: [
    TaskDetailsList,
    LucideX,
    LucideArrowLeft,
    LucideClock5,
    LucideFlagTriangleRight,
    LucideAlarmClock,
    LucideTriangleAlert,
  ],
  templateUrl: './pending-tasks-details-modal.html',
  styles: ``,
})
export class PendingTasksDetailsModal {
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
  protected pendingTasks = computed(() => this.tasks().filter((t) => t.status === 'PENDING'));
  // Gets pending tasks with high priority.
  protected pendingHighPriority = computed(() =>
    this.pendingTasks().filter((t) => t.priority === 'HIGH'),
  );
  // Gets pending tasks that are due today.
  protected pendingDueToday = computed(() => {
    const today = new Date().toDateString();
    return this.pendingTasks().filter((t) => {
      return new Date(t.dueDate).toDateString() === today;
    });
  });
  // Gets overdue tasks that are not completed.
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
    { key: 'pending', label: 'Pending', count: this.pendingTasks().length },
    { key: 'high_priority', label: 'High Priority', count: this.pendingHighPriority().length },
    { key: 'due_today', label: 'Due Today', count: this.pendingDueToday().length },
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

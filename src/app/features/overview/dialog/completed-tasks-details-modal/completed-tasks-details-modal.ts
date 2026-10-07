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
import {
  LucideX,
  LucideArrowLeft,
  LucideCircleCheck,
  LucideFlagTriangleRight,
  LucideBadgeCheck,
  LucideCalendarCheck,
} from '@lucide/angular';
import { map } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { TaskDetailsList } from '../common/task-details-list/task-details-list';
import { Task } from '../../../../core/models/task';

type TaskCategory =
  'completed' | 'high_priority' | 'completed_today' | 'completed_this_week' | null;

@Component({
  selector: 'app-completed-tasks-details-modal',
  imports: [
    TaskDetailsList,
    LucideX,
    LucideArrowLeft,
    LucideCircleCheck,
    LucideFlagTriangleRight,
    LucideBadgeCheck,
    LucideCalendarCheck,
  ],
  templateUrl: './completed-tasks-details-modal.html',
  styles: ``,
})
export class CompletedTasksDetailsModal {
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
  protected readonly completedTasks = computed(() =>
    this.tasks().filter((t) => t.status === 'COMPLETED'),
  );
  // Gets completed tasks with high priority.
  protected readonly completedHighPriority = computed(() =>
    this.completedTasks().filter((t) => t.priority === 'HIGH'),
  );
  // Gets tasks completed today.
  protected readonly completedToday = computed(() => {
    const today = new Date().toDateString();
    return this.completedTasks().filter((t) => new Date(t.completedAt).toDateString() === today);
  });
  // Gets completed tasks from this week.
  protected readonly completedThisWeek = computed(() => {
    const now = new Date();
    const startOfWeek = new Date(now);

    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday as first day

    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    return this.completedTasks().filter(
      (t) => t.completedAt && new Date(t.completedAt) >= startOfWeek,
    );
  });

  // Category rows displayed in the task breakdown.
  // prettier-ignore
  protected categories = computed(() => [
    { key: 'completed', label: 'Completed', count: this.completedTasks().length },
    { key: 'high_priority', label: 'High Priority', count: this.completedHighPriority().length },
    { key: 'completed_today', label: 'Completed Today', count: this.completedToday().length },
    { key: 'completed_this_week', label: 'Completed This Week', count: this.completedThisWeek().length },
  ] as const);

  closed = output<void>(); // used to notify the parent when the modal is closed.
  protected readonly isClosing = signal(false); // Controls the modal closing animation.
  protected readonly isReturning = signal(false); // for animation when returning to the task breakdown.
  protected readonly selectedCategory = signal<TaskCategory>(null); // Stores the currently selected task category.
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

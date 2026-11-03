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
import { TaskDetailsList } from '../components/task-details-list/task-details-list';
import { Task } from '../../../../domains/tasks/models/task';
import { TimeZoneService } from '../../../../core/services/time-zone-service/time-zone-service';

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
  private readonly timeZones = inject(TimeZoneService);
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
    const today = new Date();
    return this.completedTasks().filter(
      (t) => t.completedAt && this.timeZones.isSameDay(t.completedAt, today),
    );
  });
  // Gets completed tasks from this week.
  protected readonly completedThisWeek = computed(() => {
    const today = this.timeZones.dateKey(new Date());
    const startOfWeek = new Date(`${today}T00:00:00Z`);
    const day = startOfWeek.getUTCDay();
    const diff = day === 0 ? 6 : day - 1; // Monday as first day

    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - diff);
    const startKey = startOfWeek.toISOString().slice(0, 10);

    return this.completedTasks().filter(
      (t) => t.completedAt && this.timeZones.dateKey(t.completedAt) >= startKey,
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

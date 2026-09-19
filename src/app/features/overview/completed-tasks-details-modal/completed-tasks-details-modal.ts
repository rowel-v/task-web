import { Component, computed, input, output, signal } from '@angular/core';
import { TaskDetailsList } from '../../../shared/components/task-details-list/task-details-list';
import { Task } from '../../../shared/models/task';
import {
  LucideX,
  LucideArrowLeft,
  LucideCircleCheck,
  LucideFlagTriangleRight,
  LucideBadgeCheck,
  LucideCalendarCheck,
} from '@lucide/angular';

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
  tasks = input.required<Task[]>(); // Input tasks from the parent component.
  protected completedTasks = computed(() => this.tasks().filter((t) => t.status === 'COMPLETED'));
  // Gets completed tasks with high priority.
  protected completedHighPriority = computed(() =>
    this.completedTasks().filter((t) => t.priority === 'HIGH'),
  );
  // Gets tasks completed today.
  protected completedToday = computed(() => {
    const today = new Date().toDateString();
    return this.completedTasks().filter((t) => new Date(t.completedAt).toDateString() === today);
  });
  // Gets completed tasks from this week.
  protected completedThisWeek = computed(() => {
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
}

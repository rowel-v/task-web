import { Component, computed, input, output, signal } from '@angular/core';
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
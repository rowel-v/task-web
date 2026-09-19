import { Component, computed, inject, Signal, signal } from '@angular/core';
import { TaskService } from '../../core/services/task-service/task-service';
import { Task } from '../../shared/models/task';
import { CommonModule } from '@angular/common';
import { TasksStatusBadge } from '../../shared/components/tasks-status-badge/tasks-status-badge';
import { TaskDetailsDialog } from '../../shared/components/dialog/task-details-dialog/task-details-dialog';
import { SearchService } from '../../core/services/search-service/search-service';
import {
  LucideClipboardList,
  LucideClock5,
  LucideCircleEllipsis,
  LucideCircleCheck,
} from '@lucide/angular';

type TabSelection = 'all' | 'pending' | 'in_progress' | 'completed';
type ModalSelection = 'create-task-dialog' | 'edit-task-dialog' | 'task-details-dialog' | null;

@Component({
  selector: 'app-tasks',
  imports: [
    CommonModule,
    LucideClipboardList,
    LucideClock5,
    LucideCircleEllipsis,
    LucideCircleCheck,
    TasksStatusBadge,
    TaskDetailsDialog,
  ],
  templateUrl: './tasks.html',
  styles: ``,
})
export class Tasks {
  private readonly taskService = inject(TaskService);
  private readonly searchService = inject(SearchService);
  protected tasks: Signal<Task[]> = this.taskService.tasks;
  protected selectedTab = signal<TabSelection>('all');
  protected tasksToDisplay = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase().trim();
    console.log(term);

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
  protected selectedTask = signal<Task | null>(null); // use for manage task
  protected selectedModal = signal<ModalSelection>(null);
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

  protected emptyState = computed(() => {
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
}
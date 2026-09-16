import { Component, computed, inject, Signal, signal } from '@angular/core';
import { TodoService } from '../../core/services/todo-service';
import { Todo } from '../../shared/models/todo';
import { CommonModule } from '@angular/common';
import { TasksStatusBadge } from '../../shared/components/tasks-status-badge/tasks-status-badge';
import { TaskDetailsDialog } from '../../shared/components/dialog/task-details-dialog/task-details-dialog';
import {
  LucideClipboardList,
  LucideClock5,
  LucideCircleEllipsis,
  LucideCircleCheck,
} from '@lucide/angular';
import { SearchService } from '../../core/services/search-service/search-service';

type TabSelection = 'all' | 'pending' | 'in_progress' | 'completed';
type ModalSelection = 'create-todo-dialog' | 'edit-todo-dialog' | 'todo-details-dialog' | null;

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
  private readonly todoService = inject(TodoService);
  private readonly searchService = inject(SearchService);
  protected todos: Signal<Todo[]> = this.todoService.todos;
  protected selectedTab = signal<TabSelection>('all');
  protected todosToDisplay = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase().trim();
    console.log(term);

    let filtered: Todo[];
    switch (this.selectedTab()) {
      case 'all':
        filtered = this.todos();
        break;
      case 'pending':
        filtered = this.todos().filter((t) => t.status === 'pending');
        break;
      case 'in_progress':
        filtered = this.todos().filter((t) => t.status === 'in_progress');
        break;
      case 'completed':
        filtered = this.todos().filter((t) => t.status === 'completed');
        break;
    }

    if (!term) {
      return filtered;
    }

    return filtered.filter(
      (t) => t.name.toLowerCase().includes(term) || t.description?.toLowerCase().includes(term),
    );
  });
  protected selectedTodo = signal<Todo | null>(null); // use for manage todo
  protected selectedModal = signal<ModalSelection>(null);
  protected closedModal = signal<boolean>(false); // for rendering animation
  protected closeModal() {
    if (this.closedModal()) {
      return;
    }
    this.closedModal.set(true);
    setTimeout(() => {
      this.selectedModal.set(null);
      this.selectedTodo.set(null);
      this.closedModal.set(false);
    }, 200);
  }

  protected emptyState = computed(() => {
    switch (this.selectedTab()) {
      case 'all':
        return {
          message: '"No pending tasks. You\'re all caught up!"',
          image: 'images/stick-man-empty-all-tasks.png',
        };
      case 'pending':
        return {
          message: '"No pending tasks. You\'re all caught up!"',
          image: 'images/stick-man-empty-pending-tasks.png',
        };
      case 'in_progress':
        return {
          message: '"Nothing in progress right now."',
          image: 'images/stick-man-empty-in-progress-tasks.png',
        };
      case 'completed':
        return {
          message: '"No completed tasks yet."',
          image: 'images/stick-man-empty-completed-tasks.png',
        };
    }
  });
}

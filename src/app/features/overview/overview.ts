import { Component, computed, inject, Signal, signal } from '@angular/core';
import { TodoService } from '../../core/services/todo-service';
import { RouterLink } from '@angular/router';
import { Todo } from '../../shared/models/todo';
import { formatDateTime } from '../../shared/utils/date-utils';
import { TotalTasksDetailsModal } from './total-tasks-details-modal/total-tasks-details-modal';
import { TasksStatusCard } from './tasks-status-card/tasks-status-card';
import { PendingTasksDetailsModal } from './pending-tasks-details-modal/pending-tasks-details-modal';
import { InprogressTasksDetailsModal } from './inprogress-tasks-details-modal/inprogress-tasks-details-modal';
import { CompletedTasksDetailsModal } from './completed-tasks-details-modal/completed-tasks-details-modal';
import { LucideArrowRight, LucidePlus } from '@lucide/angular';
import { TasksStatusBadge } from '../../shared/components/tasks-status-badge/tasks-status-badge';
import { CreateTaskDialog } from '../../shared/components/dialog/create-task-dialog/create-task-dialog';
import { TaskDetailsDialog } from '../../shared/components/dialog/task-details-dialog/task-details-dialog';

type TodosDetailsFlag = 'total' | 'pending' | 'in_progress' | 'completed' | null;
type ModalSelection = 'create-todo-dialog' | 'edit-todo-dialog' | 'todo-details-dialog' | null;

@Component({
  selector: 'app-overview',
  imports: [
    RouterLink,
    TotalTasksDetailsModal,
    TasksStatusCard,
    PendingTasksDetailsModal,
    InprogressTasksDetailsModal,
    CompletedTasksDetailsModal,
    LucidePlus,
    TasksStatusBadge,
    LucideArrowRight,
    CreateTaskDialog,
    TaskDetailsDialog,
  ],
  templateUrl: './overview.html',
  styles: ``,
})
export class Overview {
  private readonly todoService = inject(TodoService);
  protected readonly todos: Signal<Todo[]> = this.todoService.todos;
  protected selectedTodo = signal<Todo | null>(null);
  protected readonly formatDateTime: (d: Date) => string = formatDateTime;
  protected modalTodosDetails: TodosDetailsFlag = null;
  protected todosDetailsFlag = signal<TodosDetailsFlag>(null);
  protected isClosing = signal(false);
  // limit to 5 the displayed tasks in overview
  protected displayedTodaysTasks = computed(() => this.todoService.todaysTasks().slice(0, 5));

  protected openModal = signal<ModalSelection>(null);

  protected closeModal() {
    if (this.isClosing()) {
      return;
    }
    this.isClosing.set(true);
    setTimeout(() => {
      this.openModal.set(null);
      this.isClosing.set(false);
    }, 300);
  }

  protected openModalTodosDetailsFlag(currentTodosDetailsSelected: TodosDetailsFlag) {
    this.todosDetailsFlag.set(currentTodosDetailsSelected);
  }

  protected closeTodosDetails(event: Event) {
    event.stopPropagation();

    this.isClosing.set(true);

    setTimeout(() => {
      this.todosDetailsFlag.set(null);
      this.isClosing.set(false);
    }, 200);
  }
  
  protected totalTasks(): number {
    return this.todoService.totalTasks();
  }

  protected totalPendingTasks(): number {
    return this.todoService.totalPendingTasks();
  }

  protected totalInProgressTasks(): number {
    return this.todoService.totalInProgressTasks();
  }

  protected totalCompletedTasks(): number {
    return this.todoService.totalCompletedTasks();
  }

  protected completionRate(): number {
    return this.todoService.completionRate();
  }

  protected todaysTasks(): Todo[] {
    return this.todoService.todaysTasks();
  }

  protected upcomingTodos(): Todo[] {
    return this.todoService.upcomingTodos();
  }
}

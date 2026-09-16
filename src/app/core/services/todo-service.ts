import { computed, Injectable, Signal, signal } from '@angular/core';
import { Todo, TodoStatus } from '../../shared/models/todo';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly todosState = signal<Todo[]>([
    // ─────────────────────────────────────────────
    // Pending
    // ─────────────────────────────────────────────

    // {
    //   id: 1,
    //   name: 'Buy groceries',
    //   description: 'Pick up milk, eggs, and whole wheat bread from the store.',
    //   priority: 'medium',
    //   status: 'pending',
    //   duedate: new Date('2026-09-02T18:00:00Z'), // Overdue
    //   createdAt: new Date('2026-08-30T10:00:00Z'),
    //   updatedAt: new Date('2026-08-30T10:00:00Z'),
    // },
    // {
    //   id: 2,
    //   name: 'Schedule dentist appointment',
    //   description: 'Call the dental clinic and schedule a cleaning appointment.',
    //   priority: 'low',
    //   status: 'pending',
    //   duedate: new Date('2026-09-16T09:00:00Z'),
    //   createdAt: new Date('2026-08-30T19:00:00Z'),
    //   updatedAt: new Date('2026-08-30T19:00:00Z'),
    // },
    // {
    //   id: 3,
    //   name: 'Prepare project presentation',
    //   description: 'Create slides for the upcoming project presentation.',
    //   priority: 'high',
    //   status: 'pending',
    //   duedate: new Date('2026-09-05T16:00:00Z'), // Today
    //   createdAt: new Date('2026-09-01T08:00:00Z'),
    //   updatedAt: new Date('2026-09-01T08:00:00Z'),
    // },
    // {
    //   id: 4,
    //   name: 'Clean workspace',
    //   description: 'Organize the desk and remove unnecessary files and papers.',
    //   priority: 'low',
    //   status: 'pending',
    //   duedate: new Date('2026-09-05T19:00:00Z'), // Today
    //   createdAt: new Date('2026-09-03T09:00:00Z'),
    //   updatedAt: new Date('2026-09-03T09:00:00Z'),
    // },
    // {
    //   id: 5,
    //   name: 'Submit expense report',
    //   description: 'Compile receipts and submit the monthly expense report.',
    //   priority: 'high',
    //   status: 'pending',
    //   duedate: new Date('2026-09-07T17:00:00Z'),
    //   createdAt: new Date('2026-09-02T10:30:00Z'),
    //   updatedAt: new Date('2026-09-02T10:30:00Z'),
    // },
    // {
    //   id: 6,
    //   name: 'Update portfolio',
    //   description: 'Add the latest projects and technologies to the portfolio.',
    //   priority: 'medium',
    //   status: 'pending',
    //   duedate: new Date('2026-09-12T14:00:00Z'),
    //   createdAt: new Date('2026-09-03T13:00:00Z'),
    //   updatedAt: new Date('2026-09-03T13:00:00Z'),
    // },

    // // ─────────────────────────────────────────────
    // // In Progress
    // // ─────────────────────────────────────────────

    // {
    //   id: 7,
    //   name: 'Fix login bug',
    //   description: 'Resolve the 401 unauthorized error on the OAuth redirect flow.',
    //   priority: 'high',
    //   status: 'in_progress',
    //   duedate: new Date('2026-08-31T12:00:00Z'), // Overdue
    //   createdAt: new Date('2026-08-29T08:30:00Z'),
    //   updatedAt: new Date('2026-08-30T14:15:00Z'),
    // },
    // {
    //   id: 8,
    //   name: 'Implement task filtering',
    //   description: 'Add filtering by status and priority on the tasks page.',
    //   priority: 'high',
    //   status: 'in_progress',
    //   duedate: new Date('2026-09-05T15:00:00Z'), // Today
    //   createdAt: new Date('2026-09-01T09:00:00Z'),
    //   updatedAt: new Date('2026-09-04T11:30:00Z'),
    // },
    // {
    //   id: 9,
    //   name: 'Improve dashboard UI',
    //   description: 'Refine spacing, cards, colors, and responsive behavior.',
    //   priority: 'medium',
    //   status: 'in_progress',
    //   duedate: new Date('2026-09-10T18:00:00Z'),
    //   createdAt: new Date('2026-09-02T14:00:00Z'),
    //   updatedAt: new Date('2026-09-04T16:00:00Z'),
    // },
    // {
    //   id: 10,
    //   name: 'Write API documentation',
    //   description: 'Document the available Todo API endpoints and request formats.',
    //   priority: 'low',
    //   status: 'in_progress',
    //   duedate: new Date('2026-09-18T10:00:00Z'),
    //   createdAt: new Date('2026-09-03T10:00:00Z'),
    //   updatedAt: new Date('2026-09-04T09:00:00Z'),
    // },

    // // ─────────────────────────────────────────────
    // // Completed
    // // ─────────────────────────────────────────────

    // {
    //   id: 11,
    //   name: 'Review pull requests',
    //   description: 'Check the team code submissions for the new dashboard features.',
    //   priority: 'high',
    //   status: 'completed',
    //   duedate: new Date('2026-08-30T17:00:00Z'),
    //   createdAt: new Date('2026-08-30T09:00:00Z'),
    //   updatedAt: new Date('2026-08-30T16:45:00Z'),
    // },
    // {
    //   id: 12,
    //   name: 'Create database schema',
    //   description: 'Design and create the initial Todo database tables.',
    //   priority: 'high',
    //   status: 'completed',
    //   duedate: new Date('2026-08-28T15:00:00Z'),
    //   createdAt: new Date('2026-08-25T09:00:00Z'),
    //   updatedAt: new Date('2026-08-28T14:30:00Z'),
    // },
    // {
    //   id: 13,
    //   name: 'Setup Angular project',
    //   description: 'Initialize Angular, Tailwind, Angular Material, and routing.',
    //   priority: 'medium',
    //   status: 'completed',
    //   duedate: new Date('2026-08-25T12:00:00Z'),
    //   createdAt: new Date('2026-08-24T08:00:00Z'),
    //   updatedAt: new Date('2026-08-25T11:45:00Z'),
    // },
    // {
    //   id: 14,
    //   name: 'Create Todo service',
    //   description: 'Implement the Todo signal state and CRUD operations.',
    //   priority: 'medium',
    //   status: 'completed',
    //   duedate: new Date('2026-08-27T16:00:00Z'),
    //   createdAt: new Date('2026-08-26T09:00:00Z'),
    //   updatedAt: new Date('2026-08-27T15:30:00Z'),
    // },
    // // ─────────────────────────────────────────────
    // // Completed Today
    // // ─────────────────────────────────────────────
    // {
    //   id: 15,
    //   name: 'Review Angular lesson',
    //   description: 'Review Angular signals, computed values, and control flow.',
    //   priority: 'medium',
    //   status: 'completed',
    //   duedate: new Date('2026-09-13T12:00:00+08:00'),
    //   createdAt: new Date('2026-09-12T09:00:00+08:00'),
    //   updatedAt: new Date('2026-09-13T10:30:00+08:00'),
    // },

    // // ─────────────────────────────────────────────
    // // Completed This Week
    // // ─────────────────────────────────────────────
    // {
    //   id: 16,
    //   name: 'Fix login bug',
    //   description: 'Fix the authentication issue in the login flow.',
    //   priority: 'high',
    //   status: 'completed',
    //   duedate: new Date('2026-09-11T17:00:00+08:00'),
    //   createdAt: new Date('2026-09-10T08:00:00+08:00'),
    //   updatedAt: new Date('2026-09-11T16:20:00+08:00'),
    // },

    // {
    //   id: 17,
    //   name: 'Update project README',
    //   description: 'Add setup instructions and API documentation.',
    //   priority: 'low',
    //   status: 'completed',
    //   duedate: new Date('2026-09-09T18:00:00+08:00'),
    //   createdAt: new Date('2026-09-08T10:00:00+08:00'),
    //   updatedAt: new Date('2026-09-09T15:45:00+08:00'),
    // },

    // // ─────────────────────────────────────────────
    // // More varied cases
    // // ─────────────────────────────────────────────

    // {
    //   id: 18,
    //   name: 'Backup project files',
    //   description: 'Create a backup of the current project and database.',
    //   priority: 'high',
    //   status: 'pending',
    //   duedate: new Date('2026-09-20T20:00:00Z'),
    //   createdAt: new Date('2026-09-04T08:00:00Z'),
    //   updatedAt: new Date('2026-09-04T08:00:00Z'),
    // },
    // {
    //   id: 19,
    //   name: 'Refactor Todo components',
    //   description: 'Clean up duplicated logic and improve component responsibilities.',
    //   priority: 'medium',
    //   status: 'in_progress',
    //   duedate: new Date('2026-09-08T13:05:00Z'),
    //   createdAt: new Date('2026-09-02T11:00:00Z'),
    //   updatedAt: new Date('2026-09-05T09:30:00Z'),
    // },
    // {
    //   id: 20,
    //   name: 'Test responsive layout',
    //   description: 'Verify the application on desktop, tablet, and mobile screen sizes.',
    //   priority: 'low',
    //   status: 'pending',
    //   duedate: new Date('2026-09-25T15:00:00Z'),
    //   createdAt: new Date('2026-09-04T15:00:00Z'),
    //   updatedAt: new Date('2026-09-04T15:00:00Z'),
    // },
    // {
    //   id: 21,
    //   name: 'Fix modal animation',
    //   description: 'Make sure the modal opens and closes smoothly without layout issues.',
    //   priority: 'high',
    //   status: 'completed',
    //   duedate: new Date('2026-09-04T18:00:00Z'),
    //   createdAt: new Date('2026-09-03T08:00:00Z'),
    //   updatedAt: new Date('2026-09-04T17:40:00Z'),
    // },
    // {
    //   id: 22,
    //   name: 'Add empty state',
    //   description: 'Display a helpful message when there are no tasks to show.',
    //   priority: 'low',
    //   status: 'completed',
    //   duedate: new Date('2026-09-01T10:00:00Z'),
    //   createdAt: new Date('2026-08-31T09:00:00Z'),
    //   updatedAt: new Date('2026-09-01T09:45:00Z'),
    // },
    // {
    //   id: 23,
    //   name: 'Review application performance',
    //   description: 'Check unnecessary computations and optimize signal-based state.',
    //   priority: 'medium',
    //   status: 'pending',
    //   duedate: new Date('2026-10-01T11:00:00Z'),
    //   createdAt: new Date('2026-09-05T08:00:00Z'),
    //   updatedAt: new Date('2026-09-05T08:00:00Z'),
    // },
    // {
    //   id: 24,
    //   name: 'Review Angular signals',
    //   description: 'Practice signal, computed, and effect in Angular.',
    //   priority: 'high',
    //   status: 'in_progress',
    //   duedate: new Date('2026-09-13T11:00:00+08:00'),
    //   createdAt: new Date('2026-09-13T08:00:00+08:00'),
    //   updatedAt: new Date('2026-09-13T10:00:00+08:00'),
    // },

    // {
    //   id: 25,
    //   name: 'Finish Todo modal',
    //   description: 'Complete the task details modal and category navigation.',
    //   priority: 'high',
    //   status: 'pending',
    //   duedate: new Date('2026-09-13T14:00:00+08:00'),
    //   createdAt: new Date('2026-09-13T09:00:00+08:00'),
    //   updatedAt: new Date('2026-09-13T09:00:00+08:00'),
    // },

    // {
    //   id: 26,
    //   name: 'Test task filters',
    //   description: 'Test pending, completed, overdue, and upcoming filters.',
    //   priority: 'medium',
    //   status: 'pending',
    //   duedate: new Date('2026-09-13T16:00:00+08:00'),
    //   createdAt: new Date('2026-09-13T09:30:00+08:00'),
    //   updatedAt: new Date('2026-09-13T09:30:00+08:00'),
    // },

    // {
    //   id: 27,
    //   name: 'Update Git branch',
    //   description: 'Commit the latest Todo UI changes and update the feature branch.',
    //   priority: 'low',
    //   status: 'completed',
    //   duedate: new Date('2026-09-13T10:00:00+08:00'),
    //   createdAt: new Date('2026-09-13T08:30:00+08:00'),
    //   updatedAt: new Date('2026-09-13T09:45:00+08:00'),
    //   completedAt: new Date('2026-09-13T09:45:00+08:00'),
    // },
  ]);
  todos = this.todosState.asReadonly();

  totalTasks = computed(() => this.todosState().length);
  totalPendingTasks = computed(
    () => this.todosState().filter((t) => t.status === 'pending').length,
  );
  totalInProgressTasks = computed(
    () => this.todosState().filter((t) => t.status === 'in_progress').length,
  );
  totalCompletedTasks = computed(
    () => this.todosState().filter((t) => t.status === 'completed').length,
  );

  readonly completionRate = computed(() => {
    const todos = this.todosState();
    if (todos.length === 0) {
      return 0;
    }
    const completed = todos.filter((todo) => todo.status === 'completed').length;
    return Math.round((completed / todos.length) * 100);
  });

  readonly todaysTasks = computed(() => {
    const today = new Date();

    return this.todosState().filter((todo) => {
      const dueDate = new Date(todo.duedate);

      return (
        dueDate.getFullYear() === today.getFullYear() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getDate() === today.getDate()
      );
    });
  });

  private defaultId = 0;

  addTodo(todo: Todo) {
    this.todosState.update((todos) => [
      ...todos,
      {
        ...todo,
        id: this.defaultId++,
      },
    ]);
  }

  updateStatus(todo: Todo, status: TodoStatus) {
    this.todosState.update((todos) => todos.map((t) => (t.id === todo.id ? { ...t, status } : t)));
  }

  deleteTodo(todo: Todo) {
    this.todosState.update((todos) => todos.filter((t) => t.id !== todo.id));
  }

  updateTodo(todo: Todo) {
    this.todosState.update((todos) =>
      todos.map((t) =>
        t.id === todo.id
          ? {
              ...t,
              name: todo.name,
              description: todo.description,
              priority: todo.priority,
              status: todo.status,
              duedate: todo.duedate,
              updatedAt: new Date(),
            }
          : t,
      ),
    );
  }

  upcomingTodos(): Todo[] {
    const now = new Date();
    return this.todos()
      .filter((todo) => {
        if (!todo.duedate) {
          return false;
        }
        return new Date(todo.duedate) > now;
      })
      .sort((a, b) => {
        return new Date(a.duedate!).getTime() - new Date(b.duedate!).getTime();
      });
  }
}

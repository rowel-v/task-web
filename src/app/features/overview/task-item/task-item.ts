import { Component, computed, input } from '@angular/core';
import { Task } from '../../../shared/models/task';
import { TasksStatusBadge } from '../../../shared/components/tasks-status-badge/tasks-status-badge';

@Component({
  selector: 'app-task-item',
  imports: [TasksStatusBadge],
  templateUrl: './task-item.html',
  styles: ``,
})
export class TaskItem {
  task = input.required<Task>();
  
  protected readonly isCompleted = computed(() => this.task().status === 'COMPLETED');
}

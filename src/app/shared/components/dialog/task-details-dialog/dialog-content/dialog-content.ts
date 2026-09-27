import { Component, computed, input } from '@angular/core';
import { Task } from '../../../../models/task';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-dialog-content',
  imports: [TitleCasePipe, DatePipe],
  templateUrl: './dialog-content.html',
  styles: ``,
})
export class DialogContent {
  task = input.required<Task>();
  errorMessage = input.required<string | null>();

  protected readonly priorityClasses = computed(() => {
    const map = {
      LOW: 'text-app-background-green',
      MEDIUM: 'text-blue-500',
      HIGH: 'text-red-500',
    };
    return map[this.task().priority];
  });

  protected readonly statusClasses = computed(() => {
    const map = {
      PENDING: 'text-app-background-green border-app-background-green',
      IN_PROGRESS: 'text-[#B8860B] border-[#B8860B]',
      COMPLETED: 'text-app-text-green border-app-text-green opacity-60',
    };
    return map[this.task().status];
  });

  protected readonly isOverdue = computed(() => {
    const t = this.task();
    return t.status !== 'COMPLETED' && new Date(t.dueDate) < new Date();
  });
}

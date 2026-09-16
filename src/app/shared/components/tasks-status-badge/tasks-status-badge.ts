import { Component, input } from '@angular/core';
import { LucideClock5, LucideCircleEllipsis, LucideCircleCheck } from '@lucide/angular';
import { TodoStatus } from '../../models/todo';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-tasks-status-badge',
  imports: [LucideClock5, LucideCircleEllipsis, LucideCircleCheck, TitleCasePipe],
  templateUrl: './tasks-status-badge.html',
  styles: ``,
})
export class TasksStatusBadge {
  status = input.required<TodoStatus>();
}

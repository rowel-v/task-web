import { Component, input } from '@angular/core';
import { LucideClock5, LucideCircleEllipsis, LucideCircleCheck } from '@lucide/angular';
import { TaskStatus } from '../../../core/models/task'
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-tasks-status-badge',
  imports: [LucideClock5, LucideCircleEllipsis, LucideCircleCheck, TitleCasePipe],
  templateUrl: './tasks-status-badge.html',
  styles: ``,
})
export class TasksStatusBadge {
  status = input.required<TaskStatus>();
}

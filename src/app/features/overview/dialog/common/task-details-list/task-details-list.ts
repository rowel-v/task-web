import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideGhost,
  LucideCircleCheck,
  LucideClock5,
  LucideTriangleAlert,
  LucideCalendarClock,
  LucideFlagTriangleRight,
  LucideAlarmClock,
  LucideCircleEllipsis,
  LucideBadgeCheck,
  LucideCalendarCheck,
} from '@lucide/angular';
import { Task } from '../../../../../core/models/task'

type LucidIconSelection =
  | 'completed'
  | 'pending'
  | 'overdue'
  | 'upcoming'
  | 'high_priority'
  | 'due_today'
  | 'in_progress'
  | 'completed_today'
  | 'completed_this_week';

@Component({
  selector: 'app-task-details-list',
  imports: [
    LucideGhost,
    LucideCircleCheck,
    LucideClock5,
    LucideTriangleAlert,
    LucideCalendarClock,
    LucideFlagTriangleRight,
    LucideAlarmClock,
    LucideCircleEllipsis,
    LucideBadgeCheck,
    LucideCalendarCheck,
    RouterLink
  ],
  templateUrl: './task-details-list.html',
  styles: ``,
})
export class TaskDetailsList {
  tasks = input.required<Task[]>();
  icon = input.required<LucidIconSelection>();
  iconWhenEmpty = input.required<string>();
  titleWhenEmpty = input.required<string>();
  descriptionWhenEmpty = input.required<string>();
  isEnteringDetail = input.required<boolean>(); // for animation when navigate to specific task
  selectedTask = signal<Task | null>(null);
}

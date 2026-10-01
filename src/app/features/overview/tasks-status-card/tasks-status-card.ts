import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  LucideClipboardList,
  LucideClock5,
  LucideCircleEllipsis,
  LucideCircleCheck,
} from '@lucide/angular';

type StatusCardIcon = 'total' | 'pending' | 'in_progress' | 'completed';

@Component({
  selector: 'app-tasks-status-card',
  imports: [
    MatIconModule,
    LucideClipboardList,
    LucideClock5,
    LucideCircleEllipsis,
    LucideCircleCheck,
  ],
  templateUrl: './tasks-status-card.html',
  styles: ``,
})
export class TasksStatusCard {
  icon = input.required<StatusCardIcon>();
  title = input.required<string>();
  value = input.required<number>(); // pass the total number of specific task base on status [all tasks, pending, in progress, completed]
  description = input.required<string>();
  pressed = output<void>();
}

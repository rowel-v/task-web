import { Component, output } from '@angular/core';
import { LucidePlus } from '@lucide/angular';

@Component({
  selector: 'app-task-empty-state',
  imports: [LucidePlus],
  templateUrl: './task-empty-state.html',
  styles: ``,
})
export class TaskEmptyState {
  pressedAddTaskBtn = output<void>();
}

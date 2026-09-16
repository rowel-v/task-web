import { Component, input, output } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { CommonModule } from '@angular/common';
import { Todo } from '../../../models/todo';

@Component({
  selector: 'app-task-details-dialog',
  imports: [LucideX, CommonModule],
  templateUrl: './task-details-dialog.html',
  styles: ``,
})
export class TaskDetailsDialog {
  todo = input.required<Todo>();
  isClosing = input.required<boolean>();
  closed = output<void>();
}

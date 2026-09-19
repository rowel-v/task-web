import { Component, input, output } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { CommonModule } from '@angular/common';
import { Task } from '../../../models/task';

@Component({
  selector: 'app-task-details-dialog',
  imports: [LucideX, CommonModule],
  templateUrl: './task-details-dialog.html',
  styles: ``,
})
export class TaskDetailsDialog {
  task = input.required<Task>();
  isClosing = input.required<boolean>();
  closed = output<void>();
}

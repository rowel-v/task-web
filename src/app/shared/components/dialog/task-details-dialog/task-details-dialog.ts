import { Component, input, output } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-details-dialog',
  imports: [LucideX, CommonModule],
  templateUrl: './task-details-dialog.html',
  styles: ``,
})
export class TaskDetailsDialog {
  closed = output<void>();
  isClosing = input.required<boolean>();
  todo = input.required<import('../../../models/todo').Todo>(); // adjust import path
}
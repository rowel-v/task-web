import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  LucideCalendar,
  LucideCheck,
  LucideFlag,
  LucidePlay,
  LucideRotateCcw,
  LucideX,
} from '@lucide/angular';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Task } from '../../../models/task';

@Component({
  selector: 'app-task-details-dialog',
  imports: [
    LucideX,
    LucideCalendar,
    LucideFlag,
    LucideCheck,
    LucidePlay,
    LucideRotateCcw,
    DatePipe,
    TitleCasePipe,
  ],
  templateUrl: './task-details-dialog.html',
  styles: ``,
})
export class TaskDetailsDialog {
  task = input.required<Task>();
  closed = output<void>();
  isClosing = input(false);

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');
  constructor() {
    afterNextRender(() => {
      this.dialogRef().nativeElement.showModal();
    });
  }
  protected onBackdropClick(event: MouseEvent) {
    if (event.target === this.dialogRef().nativeElement) {
      this.closed.emit();
    }
  }
  protected readonly statusClasses = computed(() => {
    const map = {
      PENDING: 'text-app-background-green border-app-background-green',
      IN_PROGRESS: 'text-[#B8860B] border-[#B8860B]',
      COMPLETED: 'text-app-text-green border-app-text-green opacity-60',
    };
    return map[this.task().status];
  });
  protected readonly priorityClasses = computed(() => {
    const map = {
      LOW: 'text-app-background-green',
      MEDIUM: 'text-[#FFD580]',
      HIGH: 'text-[#FF9B9B]',
    };
    return map[this.task().priority];
  });

  protected readonly isOverdue = computed(() => {
    const t = this.task();
    return t.status !== 'COMPLETED' && new Date(t.dueDate) < new Date();
  });
}

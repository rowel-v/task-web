import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Task } from '../../../models/task';
import { LucideTriangleAlert } from '@lucide/angular';
import { Button } from '../../button/button';

@Component({
  selector: 'app-delete-task-dialog',
  imports: [LucideTriangleAlert, Button],
  templateUrl: './delete-task-dialog.html',
  styles: ``,
})
export class DeleteTaskDialog {
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  constructor() {
    afterNextRender(() => {
      this.dialogRef().nativeElement.showModal();
    });
  }
  tasks = input.required<Task[]>();
  isClosing = input<boolean>(false);
  isDeleting = input<boolean>(false);
  errorMessage = input<string | null>(null);

  cancelled = output<void>();
  confirmed = output<Task[]>();

  protected readonly label = computed(() => {
    const list = this.tasks();
    return list.length === 1 ? list[0].name : `${list.length} tasks`;
  });
}

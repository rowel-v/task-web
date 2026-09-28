import { Component, input, output } from '@angular/core';
import { Button } from '../../../button/button';
import { LucideX } from '@lucide/angular';

@Component({
  selector: 'app-dialog-header',
  imports: [Button, LucideX],
  styles: ``,
  templateUrl: './dialog-header.html',
})
export class DialogHeader {
  title = input.required<string>();
  subTitle = input<string | null>(null);
  disableCloseButton = input.required<boolean>(); // disable close button {{ X }}
  closed = output<void>();
}

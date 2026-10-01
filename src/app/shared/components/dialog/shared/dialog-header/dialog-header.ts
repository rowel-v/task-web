import { Component, input, output } from '@angular/core';
import { Button } from '../../../button/button';

@Component({
  selector: 'app-dialog-header',
  imports: [Button, LucideX],
  styles: ``,
  templateUrl: './dialog-header.html',
})
export class DialogHeader {
  title = input.required<string>();
  subTitle = input<string | null>(null);
  disableCloseButton = input.required<boolean>();
  closed = output<void>();
}

import { Component, input, output } from '@angular/core';
import { Button } from '../../../button/button';

@Component({
  selector: 'app-dialog-footer',
  imports: [Button],
  templateUrl: './dialog-footer.html',
  styles: ``,
})
export class DialogFooter {
  label = input.required<string>();
  labelWhenLoading = input.required<string>();
  type = input<'button' | 'submit'>('button');
  isLoading = input.required<boolean>();
  closed = output<void>();
  confirmed = output<void>();
  protected onConfirmed() {
    this.confirmed.emit();
  }
}

import { Component, input, output } from '@angular/core';
import { AppButtonVariant } from '../../../directives/app-button-variant';

@Component({
  selector: 'app-cancel-button',
  imports: [AppButtonVariant],
  templateUrl: './cancel-button.html',
  styles: ``,
})
export class CancelButton {
  unclickable = input.required<boolean>();
  cancelled = output<void>()
}

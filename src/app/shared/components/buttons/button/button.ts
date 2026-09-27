import { Component, input, output } from '@angular/core';
import { AppButtonVariant, ButtonVariant } from '../../../directives/app-button-variant';

@Component({
  selector: 'app-button',
  imports: [AppButtonVariant],
  templateUrl: './button.html',
  styles: ``,
})
export class Button {
  variant = input.required<ButtonVariant>();
  loading = input.required<boolean>();
  unclickable = input.required<boolean>();
  clicked = output<void>();
}

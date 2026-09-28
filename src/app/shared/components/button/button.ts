import { Component, input, output } from '@angular/core';
import { AppButtonVariant, ButtonVariant } from '../../directives/app-button-variant';
import { LucideX } from '@lucide/angular';

@Component({
  selector: 'app-button',
  imports: [AppButtonVariant, LucideX],
  templateUrl: './button.html',
  styles: ``,
})
export class Button {
  variant = input.required<ButtonVariant>(); // button style
  type = input<'button' | 'submit'>('button'); // include button type submit to use in form element
  pressed = output<void>(); // click event
  unclickable = input.required<boolean>(); // disable button state
  withLoadingSpinner = input<boolean>(true);
}

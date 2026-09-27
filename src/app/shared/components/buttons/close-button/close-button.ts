import { Component, input, output } from '@angular/core';
import { AppButtonVariant } from '../../../directives/app-button-variant';
import { LucideX } from '@lucide/angular';

@Component({
  selector: 'app-close-button',
  imports: [AppButtonVariant, LucideX],
  templateUrl: './close-button.html',
  styles: ``,
})
export class CloseButton {
  unclickable = input.required<boolean>() // disable button state 
  closed = output<void>()
}

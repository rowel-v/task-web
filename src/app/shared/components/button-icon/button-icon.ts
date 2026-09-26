import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button-icon',
  imports: [],
  templateUrl: './button-icon.html',
  styles: ``,
})
export class ButtonIcon {
  loading = input.required<boolean>();
}

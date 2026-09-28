import { Directive, HostBinding, input } from '@angular/core';

export type ButtonVariant = 'green' | 'cancel' | 'close';

@Directive({
  selector: '[appButtonVariant]',
})
export class AppButtonVariant {
  readonly variant = input.required<ButtonVariant>();

  private readonly classMap = {
    green:
      'btn btn-accent hover:bg-app-background-hover hover:border-app-background-hover disabled:bg-app-background-hover disabled:text-app-text-green',
    cancel:
      'btn btn-ghost hover:bg-app-background-hover text-app-background-green shadow-none border-0',
    close:
      'btn btn-ghost btn-circle size-8 hover:bg-app-background-hover text-app-background-green shadow-none border-0',
  };

  @HostBinding('class')
  get hostClass(): string {
    return this.classMap[this.variant()];
  }
}

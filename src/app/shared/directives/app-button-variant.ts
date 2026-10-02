import { Directive, HostBinding, input } from '@angular/core';

export type ButtonVariant = 'green' | 'cancel' | 'close' | 'delete';

@Directive({
  selector: '[appButtonVariant]',
})
export class AppButtonVariant {
  readonly variant = input.required<ButtonVariant>();

  private readonly classMap = {
    green:
      'btn btn-accent hover:bg-app-background-hover hover:border-app-background-hover disabled:bg-app-background-hover disabled:text-app-text-green focus-visible:bg-app-background-hover focus-visible:border-0 focus-visible:outline-0 focus-visible:shadow-none',
    cancel:
      'btn btn-ghost hover:bg-app-background-hover text-app-background-green shadow-none border-0 focus-visible:bg-app-background-hover focus-visible:outline-0',
    close:
      'btn btn-ghost btn-circle size-8 hover:bg-app-background-hover text-app-background-green shadow-none border-0  focus-visible:bg-app-background-hover focus-visible:outline-0',
    delete:
      'btn border-0 bg-red-500/90 shadow-none text-white hover:bg-red-700/75 focus-visible:bg-red-700/75 focus-visible:hover:bg-red-700/75 focus-visible:shadow-none focus-visible:outline-0',
  };

  @HostBinding('class')
  get hostClass(): string {
    return this.classMap[this.variant()];
  }
}

import { Directive, ElementRef, OnDestroy, inject, input, output } from '@angular/core';

@Directive({
  selector: '[appLongPress]',
  host: {
    '(pointerdown)': 'onDown($event)',
    '(pointermove)': 'onMove($event)',
    '(pointerup)': 'cancel()',
    '(pointerleave)': 'cancel()',
    '(pointercancel)': 'cancel()',
    '(contextmenu)': 'onContextMenu($event)',
  },
})
export class LongPress implements OnDestroy {
  // how long the finger must stay down (ms)
  readonly delay = input(500);

  // emits once the press time is reached
  readonly longPressed = output<void>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private timer?: ReturnType<typeof setTimeout>;
  private startX = 0;
  private startY = 0;
  private fired = false;

  // swallows the click that follows a long press (capture phase runs before
  // the row's inner button click handler)
  private readonly blockClick = (e: Event) => {
    if (this.fired) {
      e.stopPropagation();
      e.preventDefault();
      this.fired = false;
    }
  };

  constructor() {
    this.el.addEventListener('click', this.blockClick, true);
  }

  protected onDown(e: PointerEvent) {
    // touch only, so desktop clicks are untouched
    if (e.pointerType !== 'touch') return;

    this.fired = false;
    this.startX = e.clientX;
    this.startY = e.clientY;

    this.timer = setTimeout(() => {
      this.fired = true;
      navigator.vibrate?.(50); // small haptic tick where supported
      this.longPressed.emit();
    }, this.delay());
  }

  protected onMove(e: PointerEvent) {
    // moving more than 10px means the user is scrolling, so cancel
    if (Math.abs(e.clientX - this.startX) > 10 || Math.abs(e.clientY - this.startY) > 10) {
      this.cancel();
    }
  }

  protected cancel() {
    clearTimeout(this.timer);
  }

  // stops the browser's long-press menu on touch devices
  protected onContextMenu(e: Event) {
    if (this.fired || this.timer) e.preventDefault();
  }

  ngOnDestroy() {
    this.cancel();
    this.el.removeEventListener('click', this.blockClick, true);
  }
}

import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SelectModeService {
  private readonly _enabled = signal(false);
  readonly enabled = computed(() => this._enabled());

  toggleOn() {
    this._enabled.set(true);
  }

  toggleOff() {
    this._enabled.set(false);
  }
}

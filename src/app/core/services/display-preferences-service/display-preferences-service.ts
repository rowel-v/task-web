import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type Appearance = 'classic-teal' | 'soft-teal' | 'dark-teal';
export type TimeFormat = 'device' | '12-hour' | '24-hour';

interface DisplayPreferences {
  appearance: Appearance;
  timeFormat: TimeFormat;
}

const STORAGE_KEY = 'display-preferences';
const DEFAULT_PREFERENCES: DisplayPreferences = {
  appearance: 'classic-teal',
  timeFormat: 'device',
};

@Injectable({ providedIn: 'root' })
export class DisplayPreferencesService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly document = inject(DOCUMENT);
  private readonly preferences = signal<DisplayPreferences>(this.load());
  readonly appearance = () => this.preferences().appearance;
  readonly timeFormat = () => this.preferences().timeFormat;

  constructor() {
    this.applyAppearance();
  }

  is12Hour(): boolean {
    if (this.timeFormat() === '12-hour') return true;
    if (this.timeFormat() === '24-hour') return false;
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hour12 ?? true;
  }

  save(preferences: DisplayPreferences): boolean {
    if (!this.isBrowser) return false;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      this.preferences.set(preferences);
      this.applyAppearance();
      return true;
    } catch {
      return false;
    }
  }

  private applyAppearance(): void {
    if (this.isBrowser) this.document.documentElement.dataset['appearance'] = this.appearance();
  }

  private load(): DisplayPreferences {
    if (!this.isBrowser) return DEFAULT_PREFERENCES;

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      return {
        appearance: ['soft-teal', 'dark-teal'].includes(stored?.appearance)
          ? stored.appearance
          : 'classic-teal',
        timeFormat: ['12-hour', '24-hour'].includes(stored?.timeFormat)
          ? stored.timeFormat
          : 'device',
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }
}

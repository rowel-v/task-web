import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimeZoneService {
  private readonly selectedZone = signal<string | null>(null);
  readonly timeZone = this.selectedZone.asReadonly();

  setTimeZone(zone: string | null): void {
    if (zone) {
      // Invalid IANA names must not break date rendering throughout the app.
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: zone }).format();
      } catch {
        this.selectedZone.set(null);
        return;
      }
    }
    this.selectedZone.set(zone || null);
  }

  format(value: string | Date, options: Intl.DateTimeFormatOptions): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(undefined, {
      ...options,
      timeZone: this.timeZone() ?? undefined,
    }).format(date);
  }

  dateKey(value: string | Date): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const parts = new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', {
      timeZone: this.timeZone() ?? undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  }

  isSameDay(first: string | Date, second: string | Date): boolean {
    const day = this.dateKey(first);
    return day !== '' && day === this.dateKey(second);
  }

  /** Converts a calendar wall time in the selected zone to an absolute instant. */
  wallTimeToIso(value: string): string | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
    if (!match) return null;
    const [year, month, day, hour, minute] = match.slice(1).map(Number);
    const selectedTime = Date.UTC(year, month - 1, day, hour, minute);
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', {
      timeZone: this.timeZone() ?? undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    // Represent an instant's date and time in the selected zone as UTC for comparison.
    const localTimeAt = (instant: number): number => {
      const parts = formatter.formatToParts(new Date(instant));
      const part = (type: string) => Number(parts.find((item) => item.type === type)?.value);
      return Date.UTC(
        part('year'),
        part('month') - 1,
        part('day'),
        part('hour'),
        part('minute'),
        part('second'),
      );
    };
    const possibleInstants = new Set<number>();
    // Check offsets around the selected date, including daylight-saving transitions.
    for (const hours of [-48, -24, 0, 24, 48]) {
      const sample = selectedTime + hours * 3600000;
      const offset = localTimeAt(sample) - sample;
      const instant = selectedTime - offset;
      if (localTimeAt(instant) === selectedTime) possibleInstants.add(instant);
    }
    // Reject nonexistent local times; in an overlap, use the earlier occurrence.
    if (possibleInstants.size === 0) return null;
    return new Date(Math.min(...possibleInstants)).toISOString();
  }
}

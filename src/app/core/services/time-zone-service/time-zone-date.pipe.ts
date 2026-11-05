import { inject, Pipe, PipeTransform } from '@angular/core';
import { TimeZoneService } from './time-zone-service';
import { DisplayPreferencesService } from '../display-preferences-service/display-preferences-service';

@Pipe({ name: 'timeZoneDate', pure: false })
export class TimeZoneDatePipe implements PipeTransform {
  private readonly zones = inject(TimeZoneService);
  private readonly preferences = inject(DisplayPreferencesService);

  transform(
    value: string | Date | null | undefined,
    style: 'short' | 'medium' | 'detail' = 'short',
  ): string {
    if (!value) return '';
    const options: Intl.DateTimeFormatOptions =
      style === 'detail'
        ? { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
        : { dateStyle: style, timeStyle: style };
    return this.zones.format(value, { ...options, hour12: this.preferences.is12Hour() });
  }
}

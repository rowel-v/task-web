import { TimeZoneService } from './time-zone-service';

describe('TimeZoneService', () => {
  it('compares dates using the selected time zone', () => {
    const service = new TimeZoneService();
    service.setTimeZone('Asia/Manila');
    expect(service.dateKey('2026-11-03T16:30:00Z')).toBe('2026-11-04');
    service.setTimeZone('America/New_York');
    expect(service.dateKey('2026-11-03T16:30:00Z')).toBe('2026-11-03');
  });

  it('accounts for daylight saving changes and rejects invalid zones', () => {
    const service = new TimeZoneService();
    service.setTimeZone('America/New_York');
    const options: Intl.DateTimeFormatOptions = { hour: 'numeric', hour12: false };
    expect(Number(service.format('2026-01-03T12:00:00Z', options))).toBe(7);
    expect(Number(service.format('2026-07-03T12:00:00Z', options))).toBe(8);
    service.setTimeZone('Invalid/Place');
    expect(service.timeZone()).toBeNull();
  });

  it('converts calendar times in the selected zone, including daylight saving boundaries', () => {
    const service = new TimeZoneService();
    service.setTimeZone('Asia/Manila');
    expect(service.wallTimeToIso('2026-11-03T16:00')).toBe('2026-11-03T08:00:00.000Z');
    service.setTimeZone('America/New_York');
    expect(service.wallTimeToIso('2026-03-08T02:30')).toBeNull();
    expect(service.wallTimeToIso('2026-11-01T01:30')).toBe('2026-11-01T05:30:00.000Z');
  });
});

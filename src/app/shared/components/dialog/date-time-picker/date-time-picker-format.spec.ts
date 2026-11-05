import { TestBed } from '@angular/core/testing';
import { Calendar } from 'vanilla-calendar-pro';
import { DisplayPreferencesService } from '../../../../core/services/display-preferences-service/display-preferences-service';
import { TimeZoneService } from '../../../../core/services/time-zone-service/time-zone-service';
import { DateTimePicker } from './date-time-picker';

vi.mock('vanilla-calendar-pro', () => ({
  Calendar: vi.fn(class {
    init = vi.fn();
  }),
}));

describe('DateTimePicker time format', () => {
  beforeEach(() => {
    localStorage.removeItem('display-preferences');
    vi.mocked(Calendar).mockClear();
  });

  afterEach(() => {
    localStorage.removeItem('display-preferences');
    document.documentElement.removeAttribute('data-appearance');
  });

  it.each([
    ['12-hour', 12, '02:30 PM'],
    ['24-hour', 24, '14:30'],
  ] as const)('opens the calendar using the %s format', async (format, mode, time) => {
    TestBed.configureTestingModule({ imports: [DateTimePicker] });
    TestBed.inject(DisplayPreferencesService).save({ appearance: 'classic-teal', timeFormat: format });
    TestBed.inject(TimeZoneService).setTimeZone('Asia/Manila');
    const fixture = TestBed.createComponent(DateTimePicker);
    fixture.componentRef.setInput('defaultDate', '2026-01-02T06:30:00Z');
    fixture.detectChanges();
    await fixture.whenStable();

    const options = vi.mocked(Calendar).mock.calls[0][1];
    expect(options?.selectionTimeMode).toBe(mode);
    expect(options?.selectedTime).toBe(time);
    fixture.destroy();
  });
});

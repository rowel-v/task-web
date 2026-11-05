import { TestBed } from '@angular/core/testing';
import { DisplayPreferencesService } from '../../core/services/display-preferences-service/display-preferences-service';
import { TimeZoneDatePipe } from '../../core/services/time-zone-service/time-zone-date.pipe';
import { TimeZoneService } from '../../core/services/time-zone-service/time-zone-service';
import { Settings } from './settings';
import { NotificationService } from '../../core/services/notification-service/notification-service';
import { chooseSetting, settingRow } from './settings-test-helpers';

describe('Display preferences', () => {
  beforeEach(() => {
    localStorage.removeItem('display-preferences');
    localStorage.removeItem('task-preferences');
    document.documentElement.removeAttribute('data-appearance');
  });

  afterEach(() => {
    localStorage.removeItem('display-preferences');
    localStorage.removeItem('task-preferences');
    document.documentElement.removeAttribute('data-appearance');
  });

  it('saves and applies display settings only when saved', () => {
    TestBed.configureTestingModule({ imports: [Settings] });
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();

    chooseSetting(fixture, 'Appearance', 'Dark teal');
    chooseSetting(fixture, 'Time format', '24-hour (14:30)');
    expect(document.documentElement.dataset['appearance']).toBe('classic-teal');

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(document.documentElement.dataset['appearance']).toBe('dark-teal');
    expect(JSON.parse(localStorage.getItem('display-preferences')!)).toEqual({
      appearance: 'dark-teal',
      timeFormat: '24-hour',
    });

    fixture.destroy();
    const reopened = TestBed.createComponent(Settings);
    reopened.detectChanges();
    expect(settingRow(reopened, 'Appearance').value).toBe('dark-teal');
    expect(settingRow(reopened, 'Time format').value).toBe('24-hour');
  });

  it('saves task and display changes together with one button', () => {
    TestBed.configureTestingModule({ imports: [Settings] });
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('button[aria-label="Cancel changes"]')).toBeNull();

    chooseSetting(fixture, 'Default task view', 'Today');
    chooseSetting(fixture, 'Appearance', 'Dark teal');
    fixture.detectChanges();
    expect(localStorage.getItem('task-preferences')).toBeNull();
    expect(document.documentElement.dataset['appearance']).toBe('classic-teal');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(fixture.nativeElement.querySelectorAll('button[type="submit"]').length).toBe(1);

    button.click();
    fixture.detectChanges();
    expect(JSON.parse(localStorage.getItem('task-preferences')!).defaultView).toBe('today');
    expect(JSON.parse(localStorage.getItem('display-preferences')!).appearance).toBe('dark-teal');
    expect(document.documentElement.dataset['appearance']).toBe('dark-teal');
    expect(fixture.nativeElement.querySelector('button[type="submit"]')).toBeNull();
  });

  it('cancels changes and restores the saved preferences', () => {
    localStorage.setItem(
      'task-preferences',
      JSON.stringify({ defaultView: 'today', defaultSort: 'due-asc' }),
    );
    localStorage.setItem(
      'display-preferences',
      JSON.stringify({ appearance: 'soft-teal', timeFormat: '24-hour' }),
    );
    TestBed.configureTestingModule({ imports: [Settings] });
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    chooseSetting(fixture, 'Default task view', 'Pending');
    chooseSetting(fixture, 'Appearance', 'Dark teal');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button[aria-label="Cancel changes"]').click();
    fixture.detectChanges();
    expect(settingRow(fixture, 'Default task view').value).toBe('today');
    expect(settingRow(fixture, 'Appearance').value).toBe('soft-teal');
    expect(document.documentElement.dataset['appearance']).toBe('soft-teal');
    expect(JSON.parse(localStorage.getItem('task-preferences')!).defaultView).toBe('today');
    expect(fixture.nativeElement.querySelector('button[type="submit"]')).toBeNull();
  });

  it('hides the buttons when a change is manually reverted', () => {
    TestBed.configureTestingModule({ imports: [Settings] });
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    chooseSetting(fixture, 'Default task view', 'Today');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]')).not.toBeNull();
    chooseSetting(fixture, 'Default task view', 'All');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]')).toBeNull();
  });

  it('keeps unsaved changes available to retry when saving fails', () => {
    TestBed.configureTestingModule({ imports: [Settings] });
    const preferences = TestBed.inject(DisplayPreferencesService);
    vi.spyOn(preferences, 'save').mockReturnValue(false);
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    chooseSetting(fixture, 'Appearance', 'Dark teal');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    button.click();
    fixture.detectChanges();
    expect(button.disabled).toBe(false);
    expect(document.documentElement.dataset['appearance']).toBe('classic-teal');
    expect(
      TestBed.inject(NotificationService)
        .notifications()
        .some((item) => item.type === 'error'),
    ).toBe(true);
  });

  it.each(['classic-teal', 'soft-teal', 'dark-teal'])(
    'restores the %s appearance at startup',
    (appearance) => {
      localStorage.setItem(
        'display-preferences',
        JSON.stringify({ appearance, timeFormat: '24-hour' }),
      );
      const preferences = TestBed.inject(DisplayPreferencesService);
      expect(document.documentElement.dataset['appearance']).toBe(appearance);
      expect(preferences.is12Hour()).toBe(false);
    },
  );

  it('formats times in the selected time zone using the chosen clock', () => {
    const preferences = TestBed.inject(DisplayPreferencesService);
    const zones = TestBed.inject(TimeZoneService);
    zones.setTimeZone('Asia/Manila');
    const pipe = TestBed.runInInjectionContext(() => new TimeZoneDatePipe());

    preferences.save({ appearance: 'classic-teal', timeFormat: '12-hour' });
    expect(pipe.transform('2026-01-02T06:30:00Z', 'detail')).toContain('2:30');
    preferences.save({ appearance: 'classic-teal', timeFormat: '24-hour' });
    expect(pipe.transform('2026-01-02T06:30:00Z', 'detail')).toContain('14:30');
  });

  it('falls back to defaults for invalid saved settings', () => {
    localStorage.setItem('display-preferences', '{invalid');
    const preferences = TestBed.inject(DisplayPreferencesService);
    expect(preferences.appearance()).toBe('classic-teal');
    expect(preferences.timeFormat()).toBe('device');
  });
});

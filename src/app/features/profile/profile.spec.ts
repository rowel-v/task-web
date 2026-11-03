import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideDefaultClient } from '../../api';
import { Profile } from './profile';
import { TimeZoneService } from '../../core/services/time-zone-service/time-zone-service';

describe('Profile', () => {
  let fixture: ComponentFixture<Profile>;
  let http: HttpTestingController;
  const profile = { id: 1, username: 'alex', displayName: 'Alex', bio: 'Hello', timeZone: 'Asia/Manila', hasPhoto: false };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideDefaultClient({ basePath: '' })],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    fixture.destroy();
    vi.unstubAllGlobals();
  });

  it('previews the photo and uploads it only on save', () => {
    const OriginalURL = URL;
    vi.stubGlobal('URL', class extends OriginalURL {
      static override createObjectURL = vi.fn(() => 'blob:preview');
      static override revokeObjectURL = vi.fn();
    });
    http.expectOne('/api/tasks').flush({ message: 'OK', data: { username: 'alex', displayName: 'Alex', bio: 'Hello', tasks: [] } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[type="file"]')).toBeNull();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    expect(input.getAttribute('aria-label')).toBe('Change profile photo');
    const photo = new File(['image'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [photo] });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    http.expectNone('/api/profile/photo');
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('blob:preview');
    fixture.nativeElement.querySelector('button[type="submit"]').click();
    const upload = http.expectOne('/api/profile/photo');
    expect(upload.request.method).toBe('PUT');
    expect(upload.request.body.get('photo')).toBe(photo);
    http.expectNone('/api/profile');
    upload.flush({ message: 'OK' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[type="file"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('blob:preview');
  });

  it('discards the selected photo when editing is cancelled', () => {
    const OriginalURL = URL;
    const revoke = vi.fn();
    vi.stubGlobal('URL', class extends OriginalURL {
      static override createObjectURL = vi.fn(() => 'blob:preview');
      static override revokeObjectURL = revoke;
    });
    http.expectOne('/api/tasks').flush({ message: 'OK', data: { username: 'alex', displayName: 'Alex', tasks: [] } });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    Object.defineProperty(input, 'files', { value: [new File(['image'], 'photo.png', { type: 'image/png' })] });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button[type="button"].btn-ghost').click();
    fixture.detectChanges();
    http.expectNone('/api/profile/photo');
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(revoke).toHaveBeenCalledWith('blob:preview');
  });

  it('allows retrying the photo if profile details saved but photo upload failed', () => {
    const OriginalURL = URL;
    vi.stubGlobal('URL', class extends OriginalURL {
      static override createObjectURL = vi.fn(() => 'blob:preview');
      static override revokeObjectURL = vi.fn();
    });
    http.expectOne('/api/tasks').flush({ message: 'OK', data: { username: 'alex', displayName: 'Alex', tasks: [] } });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    Object.defineProperty(input, 'files', { value: [new File(['image'], 'photo.png', { type: 'image/png' })] });
    input.dispatchEvent(new Event('change'));
    const name: HTMLInputElement = fixture.nativeElement.querySelector('#display-name');
    name.value = 'Alex Smith';
    name.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    http.expectOne('/api/profile').flush({ message: 'OK', data: { ...profile, displayName: 'Alex Smith' } });
    http.expectOne('/api/profile/photo').flush(null, { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('profile details were saved');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    http.expectNone('/api/profile');
    http.expectOne('/api/profile/photo').flush({ message: 'OK' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Profile saved successfully');
  });

  it('loads the saved bio and preserves it when changing the display name', () => {
    http.expectOne('/api/tasks').flush({ message: 'OK', data: { username: 'alex', displayName: 'Alex', bio: 'Hello', tasks: [] } });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Hello');
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#display-name');
    expect(input.value).toBe('Alex');
    expect((fixture.nativeElement.querySelector('#bio') as HTMLTextAreaElement).value).toBe('Hello');
    input.value = 'Alex Smith';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[type="checkbox"]')).toBeNull();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    const request = http.expectOne('/api/profile');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ displayName: 'Alex Smith', bio: 'Hello', timeZone: '' });
    request.flush({ message: 'OK', data: { ...profile, displayName: 'Alex Smith' } });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Alex Smith');
    expect(fixture.nativeElement.textContent).toContain('Profile saved successfully');
  });

  it('preserves the saved bio when changing the time zone', () => {
    http.expectOne('/api/tasks').flush({ message: 'OK', data: { username: 'alex', displayName: 'Alex', bio: 'Hello', tasks: [] } });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#time-zone');
    select.value = 'Asia/Manila';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[type="checkbox"]')).toBeNull();
    fixture.nativeElement.querySelector('button[type="submit"]').click();
    const request = http.expectOne('/api/profile');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ displayName: 'Alex', bio: 'Hello', timeZone: 'Asia/Manila' });
    expect(TestBed.inject(TimeZoneService).timeZone()).toBeNull();
    request.flush({ message: 'OK', data: profile });
    fixture.detectChanges();
    expect(TestBed.inject(TimeZoneService).timeZone()).toBe('Asia/Manila');
    expect(fixture.nativeElement.textContent).toContain('Asia/Manila');
  });

  it('shows an empty state and allows adding a bio when none is saved', () => {
    http.expectOne('/api/tasks').flush({ message: 'OK', data: {
      username: 'alex', displayName: 'Alex', bio: null, timeZone: null, tasks: [],
    } });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No bio added yet.');
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    const bio: HTMLTextAreaElement = fixture.nativeElement.querySelector('#bio');
    expect(bio.value).toBe('');
    bio.value = 'New bio';
    bio.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button[type="submit"]').click();
    const request = http.expectOne('/api/profile');
    expect(request.request.body.bio).toBe('New bio');
    request.flush({ message: 'OK', data: { ...profile, bio: 'New bio', timeZone: null } });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('New bio');
  });

  it('keeps a previously saved time zone that is no longer in the standard list', () => {
    http.expectOne('/api/tasks').flush({ message: 'OK', data: { username: 'alex', displayName: 'Alex', timeZone: 'Europe/Berlin', tasks: [] } });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#time-zone');
    expect(select.value).toBe('Europe/Berlin');
    expect(select.selectedOptions[0].textContent).toContain('previous selection');
    expect(Array.from(select.querySelectorAll('optgroup')).map((group) => group.label))
      .toEqual(['Asia', 'Europe', 'United States']);
  });

  it('uses the account time zone instead of an old browser-only preference', () => {
    localStorage.setItem('my-task:time-zone:alex', 'Asia/Tokyo');
    http.expectOne('/api/tasks').flush({ message: 'OK', data: {
      username: 'alex', displayName: 'Alex', timeZone: 'Asia/Manila', tasks: [],
    } });
    fixture.detectChanges();
    expect(TestBed.inject(TimeZoneService).timeZone()).toBe('Asia/Manila');
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('#time-zone') as HTMLSelectElement).value).toBe('Asia/Manila');
  });

  it('uses the device time zone when the account has no time zone', () => {
    localStorage.setItem('my-task:time-zone:alex', 'Asia/Tokyo');
    TestBed.inject(TimeZoneService).setTimeZone('Asia/Tokyo');
    http.expectOne('/api/tasks').flush({ message: 'OK', data: {
      username: 'alex', displayName: 'Alex', timeZone: null, tasks: [],
    } });
    fixture.detectChanges();
    expect(TestBed.inject(TimeZoneService).timeZone()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Use device time zone');
  });

  it('keeps the account time zone when saving a new selection fails', () => {
    http.expectOne('/api/tasks').flush({ message: 'OK', data: {
      username: 'alex', displayName: 'Alex', timeZone: 'Asia/Tokyo', tasks: [],
    } });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#time-zone');
    select.value = 'Asia/Manila';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    http.expectOne('/api/profile').flush({}, { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    expect(TestBed.inject(TimeZoneService).timeZone()).toBe('Asia/Tokyo');
    expect(select.value).toBe('Asia/Manila');
    expect(fixture.nativeElement.textContent).toContain('Could not save your profile');
  });

  it('does not apply a time zone until the user saves', () => {
    http.expectOne('/api/tasks').flush({ message: 'OK', data: { username: 'alex', displayName: 'Alex', tasks: [] } });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#time-zone');
    select.value = 'Asia/Tokyo';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(TestBed.inject(TimeZoneService).timeZone()).toBeNull();
    fixture.nativeElement.querySelector('button[type="button"].btn-ghost').click();
    fixture.detectChanges();
    expect(localStorage.getItem('my-task:time-zone:alex')).toBeNull();
    expect(TestBed.inject(TimeZoneService).timeZone()).toBeNull();
    http.expectNone('/api/profile');
  });

  it('keeps the form open after a failed save', () => {
    http.expectOne('/api/tasks').flush({ message: 'OK', data: { username: 'alex', displayName: 'Alex', tasks: [] } });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    const name: HTMLInputElement = fixture.nativeElement.querySelector('#display-name');
    name.value = 'Alex Smith';
    name.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    http.expectOne('/api/profile').flush({}, { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Could not save your profile');
  });
});

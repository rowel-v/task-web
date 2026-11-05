import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { TaskService } from '../../domains/tasks/services/task-service';
import { Tasks } from '../tasks/tasks';
import { TaskPreferencesService } from '../tasks/services/task-preferences-service/task-preferences-service';
import { Settings } from './settings';
import { chooseSetting, settingRow } from './settings-test-helpers';

@Component({ template: '' })
class TestPage {}

describe('Task preferences', () => {
  beforeEach(() => localStorage.removeItem('task-preferences'));
  afterEach(() => localStorage.removeItem('task-preferences'));

  it('saves settings and shows them when the page is reopened', () => {
    TestBed.configureTestingModule({ imports: [Settings] });
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();

    chooseSetting(fixture, 'Default task view', 'Today');
    chooseSetting(fixture, 'Default sort order', 'Priority: high');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    fixture.destroy();

    const reopened = TestBed.createComponent(Settings);
    reopened.detectChanges();
    expect(settingRow(reopened, 'Default task view').value).toBe('today');
    expect(settingRow(reopened, 'Default sort order').value).toBe('priority-high');
    expect(JSON.parse(localStorage.getItem('task-preferences')!)).toEqual({
      defaultView: 'today',
      defaultSort: 'priority-high',
    });
  });

  it('opens the native dropdown when the setting row is clicked', () => {
    TestBed.configureTestingModule({ imports: [Settings] });
    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    const select = settingRow(fixture, 'Default task view');
    const showPicker = vi.fn();
    Object.defineProperty(select, 'showPicker', { value: showPicker });
    select.parentElement!.click();
    expect(showPicker).toHaveBeenCalledOnce();
    select.click();
    expect(showPicker).toHaveBeenCalledOnce();
  });

  it('uses the default view for the Tasks link and keeps direct links unchanged', async () => {
    localStorage.setItem(
      'task-preferences',
      JSON.stringify({ defaultView: 'today', defaultSort: 'due-asc' }),
    );
    const redirect = routes
      .find((route) => route.path === '')!
      .children!.find((route) => route.path === 'tasks')!;
    TestBed.configureTestingModule({
      providers: [provideRouter([redirect, { path: 'tasks/:tab', component: TestPage }])],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tasks');
    expect(TestBed.inject(Router).url).toBe('/tasks/today');
    await harness.navigateByUrl('/tasks/completed');
    expect(TestBed.inject(Router).url).toBe('/tasks/completed');
  });

  it('uses safe defaults when the saved settings are invalid', () => {
    localStorage.setItem('task-preferences', '{invalid');
    const preferences = TestBed.inject(TaskPreferencesService);
    expect(preferences.defaultView()).toBe('all');
    expect(preferences.defaultSort()).toBe('due-asc');
  });

  it('uses the saved sort order when opening the Tasks page', () => {
    localStorage.setItem(
      'task-preferences',
      JSON.stringify({ defaultView: 'all', defaultSort: 'name-desc' }),
    );
    TestBed.configureTestingModule({
      imports: [Tasks],
      providers: [provideRouter([]), { provide: TaskService, useValue: { tasks: signal([]) } }],
    });
    const fixture = TestBed.createComponent(Tasks);
    fixture.detectChanges();
    const sort: HTMLSelectElement = fixture.nativeElement.querySelector(
      'select[aria-label="Sort tasks"]',
    );
    expect(sort.value).toBe('name-desc');
    sort.value = 'due-asc';
    sort.dispatchEvent(new Event('change'));
    expect(TestBed.inject(TaskPreferencesService).defaultSort()).toBe('name-desc');
  });
});

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { TaskControllerService } from '../../../api';
import { TimeZoneService } from '../../../core/services/time-zone-service/time-zone-service';
import { TaskService } from './task-service';

describe('task dates in the selected time zone', () => {
  afterEach(() => vi.useRealTimers());

  it('updates the today list when the preferred zone changes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-03T16:30:00Z'));
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(),
      { provide: TaskControllerService, useValue: { getTasks: () => of({ data: {
        username: 'test', displayName: 'Test', timeZone: 'Asia/Manila', tasks: [{
          id: 1, name: 'Task', priority: 'LOW', status: 'PENDING',
          dueDate: '2026-11-03T14:00:00Z', createdAt: '2026-11-01T00:00:00Z',
          updatedAt: '2026-11-01T00:00:00Z',
        }],
      } }) } },
    ] });
    const tasks = TestBed.inject(TaskService);
    const zones = TestBed.inject(TimeZoneService);
    tasks.getAllTask().subscribe();
    expect(zones.timeZone()).toBe('Asia/Manila');
    expect(tasks.todaysTasks()).toHaveLength(0);
    zones.setTimeZone('America/New_York');
    expect(tasks.todaysTasks()).toHaveLength(1);
  });

  it('refreshes today and upcoming tasks as time passes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-03T23:59:30Z'));
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(),
      { provide: TaskControllerService, useValue: { getTasks: () => of({ data: {
        username: 'test', displayName: 'Test', timeZone: 'UTC', tasks: [{
          id: 1, name: 'Task', priority: 'LOW', status: 'PENDING',
          dueDate: '2026-11-04T00:00:20Z', createdAt: '2026-11-01T00:00:00Z',
          updatedAt: '2026-11-01T00:00:00Z',
        }],
      } }) } },
    ] });
    const tasks = TestBed.inject(TaskService);
    tasks.getAllTask().subscribe();
    expect(tasks.todaysTasks()).toHaveLength(0);
    expect(tasks.upcomingTasks()).toHaveLength(1);

    vi.advanceTimersByTime(60_000);

    expect(tasks.todaysTasks()).toHaveLength(1);
    expect(tasks.upcomingTasks()).toHaveLength(0);
  });
});

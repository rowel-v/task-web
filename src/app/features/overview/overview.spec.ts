import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TaskService } from '../../domains/tasks/services/task-service';
import { Task } from '../../domains/tasks/models/task';
import { provideDefaultClient } from '../../api';

import { Overview } from './overview';

describe('Overview', () => {
  let component: Overview;
  let fixture: ComponentFixture<Overview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Overview],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideDefaultClient({ basePath: '' }),
        { provide: BreakpointObserver, useValue: { observe: () => of({ matches: false }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Overview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Overview task actions', () => {
  it('archives a completed task instead of sending a status update', () => {
    const archiveTask = vi.fn(() => of(undefined));
    const updateTaskStatus = vi.fn(() => of(undefined));

    TestBed.configureTestingModule({
      providers: [
        { provide: TaskService, useValue: { tasks: signal([]), archiveTask, updateTaskStatus } },
        { provide: Router, useValue: { navigate: vi.fn(() => Promise.resolve(true)) } },
        { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({})) } },
        { provide: BreakpointObserver, useValue: { observe: () => of({ matches: false }) } },
      ],
    });

    const component = TestBed.runInInjectionContext(() => new Overview());
    const task = { id: 1, status: 'COMPLETED', archive: false } as Task;

    component['onTaskUpdatedStatus']({ targetTask: task, archive: true, action: undefined! });

    expect(archiveTask).toHaveBeenCalledWith([task]);
    expect(updateTaskStatus).not.toHaveBeenCalled();
  });
});

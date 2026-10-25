import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksStatusBadge } from './tasks-status-badge';

describe('TasksStatusBadge', () => {
  let component: TasksStatusBadge;
  let fixture: ComponentFixture<TasksStatusBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksStatusBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksStatusBadge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

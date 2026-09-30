import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskEmptyState } from './task-empty-state';

describe('TaskEmptyState', () => {
  let component: TaskEmptyState;
  let fixture: ComponentFixture<TaskEmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskEmptyState],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskEmptyState);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksStatusCard } from './tasks-status-card';

describe('TasksStatusCard', () => {
  let component: TasksStatusCard;
  let fixture: ComponentFixture<TasksStatusCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksStatusCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksStatusCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

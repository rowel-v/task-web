import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsList } from './task-details-list';

describe('TodoDetailsList', () => {
  let component: TaskDetailsList;
  let fixture: ComponentFixture<TaskDetailsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailsList],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

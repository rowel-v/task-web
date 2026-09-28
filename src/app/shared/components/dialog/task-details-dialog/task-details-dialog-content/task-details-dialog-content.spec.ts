import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsDialogContent } from './task-details-dialog-content';

describe('TaskDetailsDialogContent', () => {
  let component: TaskDetailsDialogContent;
  let fixture: ComponentFixture<TaskDetailsDialogContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailsDialogContent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsDialogContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

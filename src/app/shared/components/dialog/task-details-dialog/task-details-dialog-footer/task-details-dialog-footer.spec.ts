import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsDialogFooter } from './task-details-dialog-footer';

describe('TaskDetailsDialogFooter', () => {
  let component: TaskDetailsDialogFooter;
  let fixture: ComponentFixture<TaskDetailsDialogFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailsDialogFooter],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsDialogFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsDialogHeader } from './task-details-dialog-header';

describe('TaskDetailsDialogHeader', () => {
  let component: TaskDetailsDialogHeader;
  let fixture: ComponentFixture<TaskDetailsDialogHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailsDialogHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsDialogHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

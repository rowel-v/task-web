import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTaskDialog } from './edit-task-dialog';
import { Task } from '../../models/task';

describe('EditTaskDialog', () => {
  let component: EditTaskDialog;
  let fixture: ComponentFixture<EditTaskDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTaskDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EditTaskDialog);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', {
      id: 1,
      name: 'Task',
      description: null,
      status: 'IN_PROGRESS',
      priority: 'LOW',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      dueDate: '2026-01-02T00:00:00Z',
      completedAt: null,
      archive: false,
      archiveAt: null,
    } satisfies Task);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('preserves the current status when editing another field', () => {
    component.ngOnInit();
    let submittedStatus: string | undefined;
    component.submitted.subscribe(({ req }) => (submittedStatus = req.status));

    component['taskForm'].patchValue({ name: 'Updated task' });
    component['onSubmit']();

    expect(submittedStatus).toBe('IN_PROGRESS');
  });
});

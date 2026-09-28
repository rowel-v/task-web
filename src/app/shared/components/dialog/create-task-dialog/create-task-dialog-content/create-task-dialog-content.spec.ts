import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTaskDialogContent } from './create-task-dialog-content';

describe('CreateTaskDialogContent', () => {
  let component: CreateTaskDialogContent;
  let fixture: ComponentFixture<CreateTaskDialogContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTaskDialogContent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTaskDialogContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteTaskDialog } from './delete-task-dialog';

describe('DeleteTaskDialog', () => {
  let component: DeleteTaskDialog;
  let fixture: ComponentFixture<DeleteTaskDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteTaskDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteTaskDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

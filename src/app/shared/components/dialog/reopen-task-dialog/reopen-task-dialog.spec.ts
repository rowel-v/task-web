import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReopenTaskDialog } from './reopen-task-dialog';

describe('ReopenTaskDialog', () => {
  let component: ReopenTaskDialog;
  let fixture: ComponentFixture<ReopenTaskDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReopenTaskDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ReopenTaskDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

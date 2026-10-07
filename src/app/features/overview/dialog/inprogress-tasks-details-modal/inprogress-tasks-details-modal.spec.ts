import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InprogressTasksDetailsModal } from './inprogress-tasks-details-modal';

describe('InprogressTasksDetailsModal', () => {
  let component: InprogressTasksDetailsModal;
  let fixture: ComponentFixture<InprogressTasksDetailsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InprogressTasksDetailsModal],
    }).compileComponents();

    fixture = TestBed.createComponent(InprogressTasksDetailsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

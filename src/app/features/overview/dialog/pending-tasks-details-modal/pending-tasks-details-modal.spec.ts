import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingTasksDetailsModal } from './pending-tasks-details-modal';

describe('PendingTasksDetailsModal', () => {
  let component: PendingTasksDetailsModal;
  let fixture: ComponentFixture<PendingTasksDetailsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingTasksDetailsModal],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingTasksDetailsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

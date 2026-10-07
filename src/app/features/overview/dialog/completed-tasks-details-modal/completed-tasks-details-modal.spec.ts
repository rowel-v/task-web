import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedTasksDetailsModal } from './completed-tasks-details-modal';

describe('CompletedTasksDetailsModal', () => {
  let component: CompletedTasksDetailsModal;
  let fixture: ComponentFixture<CompletedTasksDetailsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedTasksDetailsModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CompletedTasksDetailsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

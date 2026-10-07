import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalTasksDetailsModal } from './total-tasks-details-modal';

describe('TotalTasksDetailsModal', () => {
  let component: TotalTasksDetailsModal;
  let fixture: ComponentFixture<TotalTasksDetailsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalTasksDetailsModal],
    }).compileComponents();

    fixture = TestBed.createComponent(TotalTasksDetailsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

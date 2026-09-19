import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyTasks } from './empty-tasks';

describe('EmptyTasks', () => {
  let component: EmptyTasks;
  let fixture: ComponentFixture<EmptyTasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyTasks],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyTasks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

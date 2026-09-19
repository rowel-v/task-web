import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoDetailsList } from './task-details-list';

describe('TodoDetailsList', () => {
  let component: TodoDetailsList;
  let fixture: ComponentFixture<TodoDetailsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoDetailsList],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoDetailsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

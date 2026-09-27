import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogContent } from './dialog-content';

describe('DialogContent', () => {
  let component: DialogContent;
  let fixture: ComponentFixture<DialogContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogContent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

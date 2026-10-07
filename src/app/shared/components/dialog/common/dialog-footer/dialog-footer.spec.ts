import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogFooter } from './dialog-footer';

describe('DialogFooter', () => {
  let component: DialogFooter;
  let fixture: ComponentFixture<DialogFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogFooter],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

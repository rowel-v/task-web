import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonIcon } from './button-icon';

describe('ButtonIcon', () => {
  let component: ButtonIcon;
  let fixture: ComponentFixture<ButtonIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonIcon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

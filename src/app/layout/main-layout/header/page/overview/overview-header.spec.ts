import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewHeader } from './overview-header';

describe('OverviewHeader', () => {
  let component: OverviewHeader;
  let fixture: ComponentFixture<OverviewHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { SelectModeService } from './select-mode-service';

describe('SelectModeService', () => {
  let service: SelectModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

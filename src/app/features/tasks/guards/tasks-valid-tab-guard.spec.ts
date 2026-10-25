import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { tasksValidTabGuard } from './tasks-valid-tab-guard';

describe('tasksValidTabGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => tasksValidTabGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

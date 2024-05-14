import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { CanComponentDeactivate, navigationGuard } from './navigation.guard';

describe('navigationGuard', () => {
  const executeGuard: CanDeactivateFn<CanComponentDeactivate> = (...guardParameters) =>
      TestBed.runInInjectionContext(() => navigationGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { scenarioResolver } from './scenario.resolver';

describe('scenarioResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => scenarioResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});

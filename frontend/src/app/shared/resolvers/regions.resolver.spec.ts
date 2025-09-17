import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { regionsResolver } from './regions.resolver';

describe('regionsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => regionsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});

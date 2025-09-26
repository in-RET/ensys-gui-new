import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { projectsResolver } from './project.resolver';

describe('projectResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
      TestBed.runInInjectionContext(() => projectsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});

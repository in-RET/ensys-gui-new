import { TestBed } from '@angular/core/testing';

import { ScenarioStateService } from './scenario-state.service';

describe('ScenarioStateService', () => {
  let service: ScenarioStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScenarioStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

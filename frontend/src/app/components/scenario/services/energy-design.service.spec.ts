import { TestBed } from '@angular/core/testing';

import { EnergyDesignService } from './energy-design.service';

describe('EnergyDesignService', () => {
  let service: EnergyDesignService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnergyDesignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

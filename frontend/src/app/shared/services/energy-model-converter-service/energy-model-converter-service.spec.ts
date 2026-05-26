import { TestBed } from '@angular/core/testing';

import { EnergyModelConverterService } from './energy-model-converter.service';

describe('EnergyModelConverterServiceService', () => {
    let service: EnergyModelConverterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(EnergyModelConverterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

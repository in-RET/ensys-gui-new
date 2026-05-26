import { TestBed } from '@angular/core/testing';

import { ModalStateService } from './modal-state.service';

describe('ModalStateService', () => {
  let service: ModalStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

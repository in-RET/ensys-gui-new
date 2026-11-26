import { TestBed } from '@angular/core/testing';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns the selected optional deny choice', async () => {
    const fireSpy = spyOn(Swal, 'fire').and.resolveTo({
      isConfirmed: false,
      isDenied: true,
      isDismissed: false,
    } as SweetAlertResult);

    const result = await service.confirm(
      'Choose an option.',
      'Choose',
      'First option',
      'Cancel',
      'question',
      'Second option',
    );

    expect(result).toBe('deny');
    expect(fireSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        showDenyButton: true,
        denyButtonText: 'Second option',
      }),
    );
  });
});

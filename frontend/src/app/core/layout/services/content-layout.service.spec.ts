import { TestBed } from '@angular/core/testing';

import { ContentLayoutService } from './content-layout.service';

describe('ContentLayoutService', () => {
  let service: ContentLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContentLayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

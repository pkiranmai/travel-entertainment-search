import { TestBed, inject } from '@angular/core/testing';

import { AllService } from './all.service';

describe('AllService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AllService]
    });
  });

  it('should be created', inject([AllService], (service: AllService) => {
    expect(service).toBeTruthy();
  }));
});

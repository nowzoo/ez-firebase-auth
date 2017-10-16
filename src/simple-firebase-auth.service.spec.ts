import { TestBed, inject } from '@angular/core/testing';

import { SimpleFirebaseAuthService } from './simple-firebase-auth.service';

describe('SimpleFirebaseAuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SimpleFirebaseAuthService]
    });
  });

  it('should be created', inject([SimpleFirebaseAuthService], (service: SimpleFirebaseAuthService) => {
    expect(service).toBeTruthy();
  }));
});

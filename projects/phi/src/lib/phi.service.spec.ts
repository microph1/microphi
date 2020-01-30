import { TestBed } from '@angular/core/testing';

import { PhiService } from './phi.service';

describe('PhiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PhiService = TestBed.get(PhiService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { NgCatService } from './ng-cat.service';

describe('NgCatService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgCatService = TestBed.get(NgCatService);
    expect(service).toBeTruthy();
  });
});

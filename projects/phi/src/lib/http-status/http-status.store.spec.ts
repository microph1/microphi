import { TestBed } from '@angular/core/testing';

import { HttpStatusStore } from './http-status.store';

xdescribe('NgxHttpStatusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HttpStatusStore = TestBed.get(HttpStatusStore);
    expect(service).toBeTruthy();
  });
});

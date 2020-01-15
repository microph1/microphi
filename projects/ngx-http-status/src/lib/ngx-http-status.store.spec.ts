import { TestBed } from '@angular/core/testing';

import { NgxHttpStatusStore } from './ngx-http-status.store';

xdescribe('NgxHttpStatusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxHttpStatusStore = TestBed.get(NgxHttpStatusStore);
    expect(service).toBeTruthy();
  });
});

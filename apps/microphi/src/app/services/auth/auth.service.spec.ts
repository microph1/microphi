import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.get(AuthService);

    http = TestBed.get(HttpTestingController);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  afterEach(() => {
    http.verify();
  });




});

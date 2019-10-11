import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';

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


  describe('#isAuthenticated', () => {

    describe('token not present in localStorage', () => {

      it('should return false', async (done) => {

        await service.isAuthenticated.subscribe((value) => {
          expect(value).toBeFalsy();
          done();
        });

      });
    });

    describe('token in localStorage', () => {
      beforeAll(() => {
        localStorage.drugoToken = 'my-signed-token';
      });

      it('should check if token is valid', async (done) => {

        await service.isAuthenticated.subscribe((value) => {
          expect(value).toBeTruthy();
          done();
        });

        const req = http.expectOne(`${environment.apiBase}/users/me`);
        expect(req.request.method).toBe('GET');

        req.flush({_id: '123'});


      });


      afterAll(() => {
        delete localStorage.drugoToken;
      });
    });


  });


  afterEach(() => {
    http.verify();
  });




});

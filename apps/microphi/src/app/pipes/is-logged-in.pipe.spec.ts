import { IsLoggedInPipe } from './is-logged-in.pipe';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { AuthService } from '../services/auth/auth.service';
import { AuthStore } from '../services/auth/auth.store';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('IsLoggedInPipe', () => {

  let pipe: IsLoggedInPipe;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        IsLoggedInPipe,
        AuthStore,
        AuthService
      ]
    });

    pipe = TestBed.get(IsLoggedInPipe);
  }));

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});

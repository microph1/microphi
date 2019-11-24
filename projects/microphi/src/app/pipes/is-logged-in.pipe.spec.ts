import { IsLoggedInPipe } from './is-logged-in.pipe';
import { async, TestBed } from '@angular/core/testing';
import { AuthService } from '../services/auth/auth.service';

describe('IsLoggedInPipe', () => {

  let pipe: IsLoggedInPipe;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        IsLoggedInPipe,
        AuthService
      ]
    });

    pipe = TestBed.get(IsLoggedInPipe);
  }));

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});

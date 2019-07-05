import { IsLoggedInPipe } from './is-logged-in.pipe';

describe('IsLoggedInPipe', () => {
  it('create an instance', () => {
    const pipe = new IsLoggedInPipe();
    expect(pipe).toBeTruthy();
  });
});

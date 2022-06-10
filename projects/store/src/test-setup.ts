import { setMatchers } from '@microphi/test';

setMatchers(
  (actual, expected) => expect(actual).toEqual(expect.arrayContaining(expected)),
  (actual, expected) => expect(actual).toEqual(expected)
);

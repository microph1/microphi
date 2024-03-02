import { setMatchers } from '@microgamma/expect-observable';

setMatchers(
  (actual, expected) => expect(actual).toContainEqual(expected),
  (actual, expected) => expect(actual).toEqual(expected)
);

import { setMatchers } from '@microphi/marbles';

setMatchers(
  (actual, expected) => expect(actual).toContainEqual(expected),
  (actual, expected) => expect(actual).toEqual(expected)
);

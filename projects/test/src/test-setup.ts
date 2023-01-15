import 'jest-preset-angular/setup-jest';
import { setMatchers } from '../src/lib/expect-observable/matchers';


setMatchers(
  (actual, expected) => expect(actual).toContainEqual(expected),
  (actual, expected) => expect(actual).toEqual(expected)
);

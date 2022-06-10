import 'jest-preset-angular/setup-jest';

import { setMatchers } from './lib/expect-observable/expect-observable';

setMatchers(
  (actual, expected) => expect(actual).toEqual(expect.arrayContaining(expected)),
  (actual, expected) => expect(actual).toEqual(expected)
);

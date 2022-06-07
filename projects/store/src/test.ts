// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { setMatchers } from '@microphi/test';
import arrayContaining = jasmine.arrayContaining;

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
}
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);

console.log('// Set matches for expect-observable');
setMatchers(
  (actual, expected) => {

    expect(actual).toEqual(arrayContaining(expected));
  },
  (actual, expected) => {

    expect(actual).toEqual(expected);
  }
);



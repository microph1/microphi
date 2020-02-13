import { setUpTestBedForDirective } from '../testing/set-up-test-bed';
import { AnimateTextDirective } from './animate-text.directive';
import { TestBed } from '@angular/core/testing';

describe('AnimateTextDirective', () => {
  let directive;

  beforeEach(setUpTestBedForDirective(AnimateTextDirective));
  beforeEach(() => {
    directive = TestBed.get(AnimateTextDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});

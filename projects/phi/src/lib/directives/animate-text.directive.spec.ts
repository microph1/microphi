import { setUpTestBedForDirective } from '../testing/set-up-test-bed';
import { AnimateTextDirective } from './animate-text.directive';
import { TestBed } from '@angular/core/testing';

xdescribe('AnimateTextDirective', () => {
  let directive;

  beforeEach(setUpTestBedForDirective(AnimateTextDirective));
  beforeEach(() => {
    directive = TestBed.inject(AnimateTextDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});

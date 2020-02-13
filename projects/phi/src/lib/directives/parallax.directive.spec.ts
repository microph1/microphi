import { ParallaxDirective } from './parallax.directive';
import { TestBed } from '@angular/core/testing';
import { setUpTestBedForDirective } from '../testing/set-up-test-bed';

fdescribe('ParallaxDirective', () => {


  let directive: ParallaxDirective;

  beforeEach(setUpTestBedForDirective(ParallaxDirective));

  beforeEach(() => {
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});

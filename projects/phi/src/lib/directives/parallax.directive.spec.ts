import { ParallaxDirective } from './parallax.directive';
import { setUpTestBedForDirective } from '../testing/set-up-test-bed';
import { TestBed } from '@angular/core/testing';

xdescribe('ParallaxDirective', () => {

  let directive: ParallaxDirective;

  beforeEach(setUpTestBedForDirective(ParallaxDirective));

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParallaxDirective]

    });

    directive = TestBed.inject(ParallaxDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});

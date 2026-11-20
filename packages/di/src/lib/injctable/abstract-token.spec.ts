import { TestBed } from '../../testing/test-bed';
import { Inject } from './inject.decorator';
import { Injectable } from './injectable.decorator';
import { injector } from './injector';

@Injectable()
abstract class Clock {
  abstract now(): number;
}

class FixedClock extends Clock {
  now() {
    return 42;
  }
}

@Injectable()
class Timestamper {
  constructor(@Inject(Clock) private clock: Clock) {}

  stamp() {
    return this.clock.now();
  }
}

describe('an abstract class as a token', () => {

  beforeEach(() => {
    TestBed.configure({ providers: [{ provide: Clock, useClass: FixedClock }, Timestamper] });
  });

  it('should inject the class provided for it', () => {
    expect(injector(Timestamper).stamp()).toBe(42);
  });

  it('should be resolvable with injector', () => {
    expect(injector(Clock)).toBeInstanceOf(FixedClock);
  });
});

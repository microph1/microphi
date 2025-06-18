import { bootstrap } from '../lib/container/bootstrap';
import { DI, DIOptions, providers } from '../lib/container/di.decorator';
import { Klass } from '../lib/types';

export class TestBed {

  static configure(config: DIOptions): void {
    // we want to have fresh instances every time configure is called
    // usually in `beforeEach` section
    providers.reset();


    @DI(config)
    class App {}

    bootstrap(App);
  }

  static inject(klass: Klass) {
    return providers.getInstance(klass);
  }

}

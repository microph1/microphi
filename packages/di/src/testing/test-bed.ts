import { DI, DIOptions, providers } from '../container/di.decorator';
import { Klass } from '../types';
import { bootstrap } from '../container/bootstrap';

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

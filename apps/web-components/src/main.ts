import { bootstrap, DI, Inject } from '@microgamma/digator';
import { FxTestComponent } from './components/test/test.component';
import { RootComponent } from './components/root.component';
import { setNamespace } from '@microgamma/loggator';
import { FxForElement } from './lib/fx-for.element';

setNamespace('web-components');

@DI({
  providers: [
    FxTestComponent,
    RootComponent,
    FxForElement,
  ]
})
class App {
  constructor(
    @Inject(RootComponent) root: RootComponent,
  ) {
    console.log('constructing app');

    document.body.appendChild(root);
  }
}

const app = bootstrap(App);

console.log({app});


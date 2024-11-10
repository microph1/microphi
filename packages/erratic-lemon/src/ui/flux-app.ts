import { App, registerPipe, } from '@microphi/flux';
import { FxRootComponent } from './components/fx-root/fx-root.component';
import { FxIf } from './components/components/fx-if.component';
import { FxFor } from './components/components/fx-for.component';
import { TestLabelComponent } from './components/test-label.component';
import { FxItem } from './components/components/fx-item.component';


registerPipe('json', (value: object) => {
  return JSON.stringify(value, null, 2);
});

@App({
  providers: [],
  declarations: [
    FxRootComponent,
    TestLabelComponent,
    FxItem,
    FxIf,
    FxFor,
  ]
})
export class FluxApp {

  constructor() {

    console.log('app started');
  }
}

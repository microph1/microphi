import { App, registerGlobalStyles, registerPipe, } from '@microphi/flux';
import { FxRootComponent } from './components/fx-root/fx-root.component';
// import { FxIf } from './components/components/fx-if.component';
import { FxFor } from './components/components/fx-for.component';
// import { TestLabelComponent } from './components/test-label.component';
import { FxItem } from './components/components/fx-item.component';
import { FxCounterComponent } from './counter/fx-counter.component';
import { FxLabelComponent } from './label/label.component';
import { FxSourceCodeViewer } from './source-code-viewer/source-code-viewer.component';

import '../style.css';

registerPipe('json', (value: object) => {
  return JSON.stringify(value, null, 2);
});

@App({
  declarations: [
    FxCounterComponent,
    FxLabelComponent,
    FxRootComponent,
    FxFor,
    FxItem,
    FxSourceCodeViewer,
    // TestLabelComponent,
    // FxIf,
  ]
})
export class FluxApp {

  constructor() {

    registerGlobalStyles('/index.scss');

    console.log('app started');
  }
}

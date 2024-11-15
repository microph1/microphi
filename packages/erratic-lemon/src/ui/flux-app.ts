import '../style.css';
import global from '../../index.scss?url';

import { App, FxFor, FxIf, FxItem, registerGlobalStyles, registerPipe } from '@microphi/flux';
import { FxRootComponent } from './components/fx-root/fx-root.component';
import { FxCounterComponent } from './components/counter/fx-counter.component';
import { FxLabelComponent } from './components/label/label.component';
import { FxSourceCodeViewer } from './components/source-code-viewer/source-code-viewer.component';


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
    FxIf
  ]
})
export class FluxApp {

  constructor() {
    registerGlobalStyles(global);
  }
}

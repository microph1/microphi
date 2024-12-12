import '../style.css';
import global from '../../index.scss?url';

import { App, FxItem, registerGlobalStyles, registerPipe } from '@microphi/flux';
import { FxRootComponent } from './components/fx-root/fx-root.component';
import { FxFor } from './components/fx-for/fx-for.component';
import { FxMenuComponent } from './components/fx-menu/fx-menu.component';
import { FxOverlayComponent } from './components/fx-overlay/fx-overlay.component';

registerPipe('json', (value: object) => {
  return JSON.stringify(value, null, 2);
});


@App({
  declarations: [
    FxRootComponent,
    FxFor,
    FxItem,
    FxMenuComponent,
    FxOverlayComponent,
  ]
})
export class FluxApp {

  constructor() {
    registerGlobalStyles(
      global,
      'https://fonts.googleapis.com/icon?family=Material+Icons'
    );


  }

}

import 'hammerjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { PortalModule } from './app/portal.module';
import { environment } from './environments/environment';
import { setNamespace } from '@microgamma/loggator';

setNamespace('drugo');


if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(PortalModule)
  .catch(err => console.error(err));

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { setNamespace } from '@microgamma/ts-debug/build/main/lib/log.decorator';

if (environment.production) {
  enableProdMode();
}

setNamespace('drugo');

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

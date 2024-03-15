import { Instance, Klass } from '../types';
import { getDIMetadata, providers } from '../container/di.decorator';
import { getDebugger } from '@microphi/debug';
import { injector } from '../injctable/injector';

const d = getDebugger('microphi:di:bootstrap');

export function bootstrap(app: Klass): Instance {
  const options = getDIMetadata(app);

  d('adding', app, 'to providers');


  providers.addInjectable(app);

  options.providers?.forEach((provider) => {
    d('configuring provider', provider);
    providers.addInjectable(provider);
  });

  return injector(app);
}

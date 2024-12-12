import { Instance, Klass } from '../types';
import { getDIMetadata, providers } from '../container/di.decorator';
import { injector } from '../injctable/injector';


export function bootstrap(app: Klass): Instance {
  const options = getDIMetadata(app);

  providers.addInjectable(app);

  options.providers?.forEach((provider) => {
    providers.addInjectable(provider);
  });

  return injector(app);
}

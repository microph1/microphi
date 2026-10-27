import { bootstrap as _bootstrap, injector, Klass } from '@microphi/di';
import { getServerlessMetadataFromClass } from '../serverless/serverless.decorator';
import { getDebugger } from '@microphi/debug';

const d = getDebugger('microgamma:apigator:bootstrap');

export function bootstrap(serverlessApp: Klass) {
  // create the app with all dependencies
  const app = _bootstrap(serverlessApp);
  d('app bootstrapped', app);

  d('getting service');

  const { service } = getServerlessMetadataFromClass(serverlessApp);
  return injector(service);
}

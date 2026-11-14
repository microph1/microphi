import { Class } from 'utility-types';
import { className, DiError } from '../errors';
import { getProviderToken } from './provider-token';
import { providers } from '../container/di.decorator';


export function injector<K extends Class<any>>(klass: K): InstanceType<K> {
  if (providers.hasInjectable(klass)) {
    return providers.getInstance(klass);
  } else {

    // what happens here is that `klass` may not be available for injection for
    // two reasons:
    // 1 - is annotated with `@Injectable` but is not "provided" in the DI container
    // 2 - it is not annotated
    if (getProviderToken(klass)) {
      throw new DiError('DI002', `${className(klass)} is not provided; add it to the providers of @DI() (or TestBed.configure in tests).`);
    } else {

      throw new DiError('DI001', `${className(klass)} is not decorated with @Injectable(); decorate it and add it to the providers of @DI().`);
    }
  }
}

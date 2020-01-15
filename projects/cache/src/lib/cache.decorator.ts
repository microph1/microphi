import { getDebugger } from '@microgamma/loggator';
import { Observable, race, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';

const d = getDebugger('Cache');

const CacheMetadata = Symbol('Cache_Cached');

export interface CacheOptions {
  ttl: number;
}

export function Cache(options: CacheOptions) {

  let lastCallArguments: any[] = [];

  return (target, propertyKey: string, descriptor) => {

    d('target', target);
    d('options', options);

    Reflect.metadata(CacheMetadata, options)(target);
    d('metadata stored', Reflect.getMetadata(CacheMetadata, target));

    const originalFunction = descriptor.value;


    target[`${propertyKey}_cached`] = new ReplaySubject(1, options.ttl);

    descriptor.value = function(...args) {
      d('arguments are', args);

      // i'm not able to capture a defaulting that happens at function level
      /*
        ie:
        ```
        @Cache(...)
        public findAll(id: number = 1) { ... }
        ```

        if the function is called like`service.findAll();` then args would be [] but `originalFunction` will actually call the service with [1]

        Is there a way to capture the defaulting mechanism?
       */

      // args changed?
      let argsNotChanged = true;

      for (let i = 0; i < lastCallArguments.length; i++) {
        argsNotChanged = argsNotChanged && lastCallArguments[i] == args[i];
      }

      d('argsNotChanged', argsNotChanged);

      if (!argsNotChanged) { // args change
        this[`${propertyKey}_cached`] = new ReplaySubject(1, options.ttl);
      }

      lastCallArguments = args;

      const req: Observable<any> = originalFunction.apply(this, args).pipe(
        tap((response) => {
          this[`${propertyKey}_cached`].next(response);
        })
      );

      // despite what the documentation says i can't find that the complete is ever called
      return race(this[`${propertyKey}_cached`], req);

    };

    return descriptor;
  };
}

export function getCachedMetadata(instance): CacheOptions {
  const metadata = Reflect.getMetadata(CacheMetadata, instance.constructor);
  d('getting cache metadata', metadata);
  return metadata;
}

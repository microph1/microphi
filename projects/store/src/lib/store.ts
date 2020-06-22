import { getDebugger } from '@microgamma/loggator';

export const StoreMetadata = '@Store';

export interface StoreOptions {
  initialState: any;
  name: string;
  actions: any;
  useLocalStorage?: boolean;
}

export function Store(options: StoreOptions) {

  const d = getDebugger(`microphi:@Store:${options.name}`);

  return (target) => {

    d('running store decorator');

    Reflect.defineMetadata(StoreMetadata, options, target);
  };
}

export function getStoreMetadata(instance): StoreOptions {
  return Reflect.getMetadata(StoreMetadata, instance.constructor);
}



import { getDebugger } from '@microgamma/loggator';

const d = getDebugger('microphi:@Store');

export interface StoreMetadata {
  initialState: any;
  name: string
}

export function Store(options: StoreMetadata) {
  d('options', options);
  return (target) => {
    d('running store decorator');

    Reflect.defineMetadata('Store', options, target);
  }
}

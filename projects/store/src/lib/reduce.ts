import { BaseStore } from './base-store';
import { getDebugger } from '@microgamma/loggator';

export const ReduceMetadata = '@Reduce';

export interface Reducers {
  [actionName: number]: string;
}

export function Reduce(onAction: number) {
  return <Store extends BaseStore<any>>(target: Store, key: string) => {
    const d = getDebugger(`microphi:@Reduce:${target.constructor.name}`);

    const reducer = Reflect.getMetadata(ReduceMetadata, target) || {};

    reducer[onAction] = key;

    d('stored reducers', reducer);

    return Reflect.defineMetadata(ReduceMetadata, reducer, target);

  };
}

export function getReduceMetadata(instance): Reducers {
  return Reflect.getMetadata(ReduceMetadata, instance) || {};
}

import { Actions, BaseStore } from './base-store';
import { getDebugger } from '@microgamma/loggator';

export const ReduceMetadata = '@Reduce';

export type Reducers<A extends Actions> = {
  [name in keyof A]: string;
};

export function Reduce<A extends Actions>(onAction: keyof A) {
  return <Store extends BaseStore<any, any>>(target: Store, key: string) => {
    const d = getDebugger(`microphi:@Reduce:${target.constructor.name}`);

    const reducer = Reflect.getMetadata(ReduceMetadata, target) || {};

    reducer[onAction] = key;

    d('stored reducers', reducer);

    return Reflect.defineMetadata(ReduceMetadata, reducer, target);

  };
}

export function getReduceMetadata<A extends Actions>(instance): Reducers<A> {
  return Reflect.getMetadata(ReduceMetadata, instance) || {};
}

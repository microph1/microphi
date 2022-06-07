import { Actions, BaseStore } from './base-store/base-store';
import 'reflect-metadata';

export const ReduceMetadata = Symbol('@Reduce');

export type Reducers<A extends Actions> = {
  [name in keyof A]: string;
};

export function Reduce<A extends Actions>(onAction: keyof A) {
  return <Store extends BaseStore<any, any>>(target: Store, key: string) => {

    const reducer = Reflect.getMetadata(ReduceMetadata, target) || {};
    reducer[onAction] = key;
    return Reflect.defineMetadata(ReduceMetadata, reducer, target);

  };
}

export function getReduceMetadata<A extends Actions>(instance): Reducers<A> {
  return Reflect.getMetadata(ReduceMetadata, instance) || {};
}

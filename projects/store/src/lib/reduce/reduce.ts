import 'reflect-metadata';
import { Store } from './store/store';

export const ReduceMetadata = Symbol('@Reduce');

export type Reducers<A> = {
  [name in keyof A]: string;
};

export function Reduce<A>(onAction: keyof A) {
  return <S extends Store<any, any>>(target: S, key: string) => {

    const reducer = Reflect.getMetadata(ReduceMetadata, target) || {};
    reducer[onAction] = key;
    return Reflect.defineMetadata(ReduceMetadata, reducer, target);

  };
}

export function getReduceMetadata<A>(instance): Reducers<A> {
  return Reflect.getMetadata(ReduceMetadata, instance) || {};
}

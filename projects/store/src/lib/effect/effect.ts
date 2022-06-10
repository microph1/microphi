import { Store } from '../store/store';
import { $Keys } from 'utility-types';

export type EffectStrategy = 'switchMap' | 'mergeMap' | 'concatMap';

export type Effects<A> = {
  [action in keyof A]: {
    functionName: string;
    strategy: EffectStrategy;
  };
};

export const EffectSymbol = Symbol.for('@Effect');

export function Effect<A>(onAction: $Keys<object & A>, operator: EffectStrategy = 'mergeMap') {

  return <
    S extends Store<any, any>
  >(target: S, key: string) => {

    const effects: Effects<A> = Reflect.getMetadata(EffectSymbol, target) || {};

    if (effects[onAction]) {
      throw new Error(`Effect ${onAction} already used on ${effects[onAction].functionName}`);
    }
    effects[onAction] = {
      functionName: key,
      strategy: operator
    };

    return Reflect.defineMetadata(EffectSymbol, effects, target);
  };
}

export function getEffectMetadata<T, A>(instance: T): Effects<A> {
  return Reflect.getMetadata(EffectSymbol, instance) || {};
}

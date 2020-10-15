import { BaseStore } from '../base-store';
import { on } from 'cluster';

export type EffectStrategy = 'switchMap' | 'mergeMap' | 'concatMap';

export interface Effects {
  // tslint:disable-next-line:ban-types
  [code: number]: {
    functionName: string;
    strategy: EffectStrategy;
  };
}

export const EffectSymbol = Symbol.for('@Effect');

// tslint:disable-next-line:ban-types
export function Effect(onAction: number, operator: EffectStrategy = 'mergeMap') {

  return <
    Store extends BaseStore<any, any>,
    Actions = Store extends BaseStore<infer State, infer E> ? E : never
  >(target: Store, key: string) => {

    const effects: Effects = Reflect.getMetadata(EffectSymbol, target) || {};

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

export function getEffectMetadata<T>(instance: T): Effects {
  return Reflect.getMetadata(EffectSymbol, instance) || {};
}

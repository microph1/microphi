import { Actions, BaseStore } from '../base-store';
import { $Keys } from 'utility-types';
import { Observable } from 'rxjs';

export type EffectStrategy = 'switchMap' | 'mergeMap' | 'concatMap';

export type Effects<A extends Actions> = {
  [action in keyof A]: {
    functionName: string;
    strategy: EffectStrategy;
  };
};

export const EffectSymbol = Symbol.for('@Effect');


export function Effect2<
  Store extends BaseStore<any, any>,
  C extends keyof _Actions,
  State = Store extends BaseStore<infer S, any> ? S : unknown,
  _Actions = Store extends BaseStore<any, infer A> ? A extends Actions ? A : unknown : unknown,
  ReturnFromEffect = _Actions[C] extends (...args: infer A) => infer P ? P extends Observable<infer T> ? T : P : never,
>(onAction: C, operator: EffectStrategy = 'mergeMap') {
  return (target: Store, key: string) => {

    // const effects: Effects<_Actions> = Reflect.getMetadata(EffectSymbol, target) || {};

    // if (effects[onAction]) {
    //   throw new Error(`Effect ${onAction} already used on ${effects[onAction].functionName}`);
    // }
    // effects[onAction] = {
    //   functionName: key,
    //   strategy: operator
    // };
    //
    // return Reflect.defineMetadata(EffectSymbol, effects, target);
  };
}

export function Effect<A extends Actions>(onAction: $Keys<A>, operator: EffectStrategy = 'mergeMap') {

  return <
    Store extends BaseStore<any, any>
  >(target: Store, key: string) => {

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

export function getEffectMetadata<T, A extends Actions>(instance: T): Effects<A> {
  return Reflect.getMetadata(EffectSymbol, instance) || {};
}

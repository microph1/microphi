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

/**
 * Tags a method<br> as an effect for the give `action`
 *
 * Strategy is one of the following rxjs pipe-able operators:
 * - `mergeMap`
 * - `concatMap`
 * - `switchMap`
 *
 * As an example consider the following:
 *
 * suppose there's an effect that takes 10 ms to return and then a reducer is called.
 *
 * Suppose we dispatch its event, the following diagram demonstrate what happens
 *
 * `D -> E -> (10) -> R`
 *
 * Event is dispatched `D`, event is executed `E`, takes 10ms and finally reducer is called with result from `E`
 *
 * Now let's suppose we dispatch again the same while `E` is still pending (executing) and suppose we call it with a different argument.
 *
 *
 * `D(a) -> E -> D(b)`
 *
 *
 * what happens next depends on the strategy used.<br>
 *
 *
 * If `switchMap` is used (default)
 *
 * `D(a) -> E(a) -> D(b) -> E(b) -> R(b)`
 *
 * the second dispatch cancels the first and so only `R(b)` is executed
 *
 *
 * If `mergeMap` is used
 *
 * `D(a) -> E(a) -> D(b) -> E(b) -> R(a) -> R(b)
 *
 * effects are executed in parallel and the first to come is the first served
 *
 * i.e.: lets say E(a) takes longer to respond then
 *
 * `D(a) -> D(b) -> E(b) ->  R(b) -> E(a) -> -> R(a)`
 *
 *
 * If `concatMap` is used then the order of calls is respected.
 *
 * in the case above we'll have whatever the timings are on the effects
 *
 * `D(a) -> D(b) -> E(a) ->  R(a) -> E(b) -> -> R(b)`
 *
 * @param action
 * @param strategy
 * @constructor
 */
export function Effect<A>(action: $Keys<object & A>, strategy: EffectStrategy = 'switchMap') {

  return <
    S extends Store<any, any>
  >(target: S, key: string) => {

    const effects: Effects<A> = Reflect.getMetadata(EffectSymbol, target) || {};

    if (effects[action]) {
      throw new Error(`Effect ${action} already used on ${effects[action].functionName}`);
    }
    effects[action] = {
      functionName: key,
      strategy: strategy
    };

    return Reflect.defineMetadata(EffectSymbol, effects, target);
  };
}

export function getEffectMetadata<T, A>(instance: T): Effects<A> {
  return Reflect.getMetadata(EffectSymbol, instance) || {};
}

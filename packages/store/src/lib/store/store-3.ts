import { $Keys } from 'utility-types';
import { BehaviorSubject, Observable, Subject, switchMap, tap } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { getDebugger } from '@microphi/debug';

const d = getDebugger('store-3');



// eslint-disable-next-line @typescript-eslint/ban-types
export type Class = new (...args: any[]) => {};

export type makeEffects<A> = {
  [k in keyof A]: A[k] extends (...args: infer I) => infer O ? (...args: I) => Observable<O> : void;
}

export type returnType<T> = T extends (...args: any[]) => infer O ? O : string[];

export type makeReducers<A, S> = {
  [k in keyof A]: (state: S, payload: returnType<A[k]>) => S;
}

export interface LoadingState {
  status: boolean;
  action: string;
  payload: any;
}

export function StoreFactory<E extends Class,
  R extends Class,
  S,
  IE = InstanceType<E>,
  IR = InstanceType<R>,
>(effects: E, reducers: R, state: S) {

  const effectNames = (Object.getOwnPropertyNames(effects.prototype))
    .filter((m) => typeof effects.prototype[m] === 'function')
    .filter((m) => m !== 'constructor') as $Keys<IE & object>[];
  d({effectNames});

  const reducerNames = (Object.getOwnPropertyNames(reducers.prototype) as $Keys<IE & object>[])
    .filter((m) => typeof reducers.prototype[m] === 'function')
    .filter((m) => m !== 'constructor');
  d({reducerNames});


  // this will be common to all instances
  const actions = new Set<keyof (IE&IR)>(
    effectNames.concat(reducerNames)
  );

  d({actions});

  return class {

    loading$: Subject<LoadingState> = new Subject<LoadingState>();

    actions: Map<keyof (IE&IR), Subject<any>> = new Map();

    _state$: BehaviorSubject<S> = new BehaviorSubject<S>(state);

    constructor(public e: IE, public r: IR) {
      d('initial state is', state);

      actions.forEach((action) => {
        d('creating Subject for action', action);
        const actionSubject = new Subject<{ action: string; payload: unknown; }>();

        actionSubject.pipe(
          withLatestFrom(this._state$),
          tap(([payload]) => {
            d('action dispatched with payload', payload);
            d('loading will start now!');
            this.loading$.next({
              action: action as string,
              payload,
              status: true
            });
          }),
          switchMap(([payload, state]) => {
            // eslint-disable-next-line @typescript-eslint/ban-types
            return (this.e[action as keyof IE] as unknown as Function).apply(this.e, payload).pipe(
              map((response) => {
                // eslint-disable-next-line @typescript-eslint/ban-types
                return (this.r[action as keyof IR] as unknown as Function).apply(this.r, [state, response]);
              }),
              // this tap needs to be here because we need the `payload`
              tap(() => {
                d('loading stops now');
                this.loading$.next({
                  action: action as string,
                  status: false,
                  payload
                });
              }, () => {
                d('loading stops now');
                this.loading$.next({
                  action: action as string,
                  status: false,
                  payload
                });
              })
            );
          })
        ).subscribe((state: S) => {
          d('new state is', state);
          this._state$.next(state);
        });

        this.actions.set(action, actionSubject);
      });

    }


    /**
     * Select a state field using a mapping function
     * @param fn mapping function
     * @example
     * store.select(({items}) => items);
     */
    select(fn: (s: S) => any) {
      return this._state$.pipe(
        map(fn)
      );
    }

    /**
     * Get the loading$ observable of a given action
     * @param a the action
     * @example
     * store.getLoadingFor('findAll')
     */
    getLoadingFor<K extends keyof IE>(a: K) {
      return this.loading$.pipe(
        filter(({action}) => {
          return action === a;
        })
      );
    }

    /**
     * Dispatch an action with the given payload.
     * @param action action to dispatch
     * @param payload payload to pass to the action
     *
     * @example
     *
     * interface IActions {
     *   findAll: () => string[];
     *   findOne: (name: string) => string;
     * }
     *
     * store.dispatch('findAll');
     * store.dispatch('findOne', 'alice');
     */
    dispatch<K extends keyof IE>(action: K, ...payload: getPayloadFromActionType<IE, K>) {
      d('dispatching action', action, 'with payload', payload);
      this.actions.get(action).next(payload);
    }
  };
}

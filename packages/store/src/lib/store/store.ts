/* eslint-disable @typescript-eslint/no-explicit-any */
import { BehaviorSubject, EMPTY, Observable, of, Subject } from 'rxjs';
import { catchError, concatMap, debounceTime, filter, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Brand, Primitive } from 'utility-types';
import { Effect, EffectStrategy, getEffects } from '../effect/effect';
import { getDebounce } from '../operators/debounce';
import { getReducers, Reducer } from '../reduce/reduce';

type Fn = (...args: any[]) => any;

export type getPayloadFromActionType<A, C extends keyof A> =
  A[C] extends Fn ? A[C] extends () => any
    ? never[] : A[C] extends (...args: infer T) => any
      ? T : never[] : A[C][];

export type PureReducer<T extends Primitive> = Brand<T, 'reducer'>;

export type makeEffects<Actions> = {
  // Effects
  [k in keyof Actions]: Actions[k] extends PureReducer<Primitive>
    ? never
    : Actions[k]
}

export type makeStore<State, Actions> =
  {
    [k in keyof makeEffects<Actions>]: makeEffects<Actions>[k]
  }
  // &
  // Actions
  &
  {
    // Reducers
    [k in keyof Actions as `on${Capitalize<string & k>}`]: Actions[k] extends (...args: any) => Observable<infer O>
    ? (state: State, payload: O) => State
    : Actions[k] extends PureReducer<infer O>
      ? (state?: State, payload?: O) => State
      : (state?: State) => State

  };

export interface LoadingState<A> {
  code: keyof A;
  payload?: any;
  response?: any;
  error?: any;
  status: boolean;
}

export abstract class Store<State, A> {

  private readonly actions: Map<string, Subject<{ name: string, payload?: any }>> = new Map();

  readonly effects: Effect[];

  readonly reducers: Reducer[];


  private _loading$ = new Subject<LoadingState<A>>();

  public get loading$(): Observable<LoadingState<A>> {
    return this._loading$.asObservable();
  }

  protected readonly _store$: BehaviorSubject<State> = new BehaviorSubject<State>(
    // we need this in order to decouple initial state between instances
    JSON.parse(JSON.stringify(this.initialState))
  );

  public get state$(): Observable<State> {
    return this._store$.asObservable();
  }

  constructor(private initialState: State) {

    this.effects = getEffects(this);
    this.reducers = getReducers(this);

    const actions = [...this.effects, ...this.reducers];

    const actionsSet = new Set<string>();

    actions.forEach(({action}) => actionsSet.add(action));

    actionsSet.forEach((key) => {

      this.actions.set(key, new Subject());

      const effect = this.effects.find((e) => e.action === key);

      const operator = Store.getOperator(effect!.strategy);

      const action = this.actions.get(key);

      const pipeline: any[] = [];

      if (action) {
        const debounce = getDebounce(this, key);
        if (debounce) {
          pipeline.push(debounceTime(debounce));
        }

        pipeline.push(

          withLatestFrom(this._store$),

          tap(([{payload}]) => {
            this._loading$.next({
              payload: payload,
              status: true,
              code: key as keyof A,
            });
          }),

          operator(([{name, payload}]) => {
            const method = name as keyof this;

            return (this[method] as Fn)(...payload).pipe(
              tap((response) => {
                this._loading$.next({
                  payload,
                  response,
                  status: false,
                  // here the action is done. The action is the only async call
                  // we can assume the loading is done as the effect is not async
                  code: key as keyof A,
                });
              }),
              // the above is
              map((response) => {
                // if an inner observable emits again the reducer will be triggered again
                // allowing for state changes from the outside.
                // Which sounds terrible said like that but if can actually be handy.
                // For example when a connection state changes:
                //
                // store.dispatch('connect') ->
                // connection happens successfully ->
                // onConnect is called -> state updated
                //
                // ... some time later
                //
                // network connection is lost connection is lost

                // by convention reducer name must be
                // on + Action
                const reducerName = `on${(name[0]).toUpperCase()}${(name as string).slice(1)}` as keyof this;

                return (this[reducerName] as Fn)(this._store$.getValue(), response);
              }),
              // error need to be swallowed here too otherwise the observable chain will be broken
              // meaning that once an action goes into an error it cannot be dispatched again
              catchError((error) => this.swallowError(key, error, payload)),
            );
          }),
        );


        // @ts-ignore
        action.pipe(...pipeline).subscribe(this._store$);

      }

    });
  }

  select<R>(projection: (s: State) => R) {
    return this.state$.pipe(
      map(projection)
    );
  }

  getLoadingFor<C extends keyof A>(action: C): Observable<boolean> {
    return this.loading$.pipe(
      filter(({code}) => code === action),
      map(({status}) => status),
    );
  }

  dispatch<C extends keyof A>(
    action: C,
    ...payload: getPayloadFromActionType<A, C>
  ) {

    if (!this.actions.has(action as string)) {
      throw new Error(`Cannot find action ${String(action)}`);
    }

    const name: string = (typeof (this as unknown as A)[action] === 'function' ? action : 'noopEffect') as string;


    this.actions.get(action as string)?.next({name, payload});
  }

  private static noopEffect(payload: any) {
    return of(payload);
  }

  private static getOperator(strategyFn: EffectStrategy) {
    if (strategyFn === 'mergeMap') {
      return mergeMap;
    } else if (strategyFn === 'concatMap') {
      return concatMap;
    } else {
      return switchMap;
    }
  }

  private swallowError(key: string, error: Error, payload: any) {
    console.log(`Error handling action "${key}"`, error);

    this._loading$.next({
      payload,
      error: error,
      status: false,
      code: key as keyof A,
    });

    return EMPTY;
  }

}

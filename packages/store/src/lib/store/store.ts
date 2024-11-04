/* eslint-disable @typescript-eslint/no-explicit-any */
import { asapScheduler, BehaviorSubject, EMPTY, identity, MonoTypeOperatorFunction, Observable, of, SchedulerLike, Subject } from 'rxjs';
import { catchError, concatMap, debounceTime, delay, filter, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Effect, EffectStrategy, getEffects } from '../effect/effect';
import { CacheSymbol } from '../operators/cache';
import { debounceOrNothing, getDebounce } from '../operators/debounce';
import { delayOrNothing, getDelay } from '../operators/delay';
import { getReducers, Reducer } from '../reduce/reduce';
import { Fn, getPayloadFromActionType, LoadingState } from './types';


export abstract class Store<State, A> {

  protected [CacheSymbol] = new Map<string, {timestamp: number; value: Observable<any>}>();

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

  constructor(private initialState: State, scheduler: SchedulerLike = asapScheduler) {

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



      if (action) {
        const debounced = getDebounce(this, key) || 0;
        const delayTime = getDelay(this, key) || 0;

        action.pipe(
          withLatestFrom(this._store$),
          debounceOrNothing(debounced),

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
              delayOrNothing(delayTime),
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
        ).subscribe((state) => this._store$.next(state as State));

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

  protected static noopEffect(payload: any) {
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

import { BehaviorSubject, EMPTY, Observable, of, Subject } from 'rxjs';
import { getReduceMetadata, Reducers } from '../reduce';
import { catchError, concatMap, filter, finalize, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Effects, EffectStrategy, getEffectMetadata } from '../effects/effect';
import { PickByValue } from 'utility-types';
import { capitalise } from '../utilities/capitalise';

export type getPayloadFromActionType<A, C extends keyof A> = A[C] extends Function ? A[C] extends () => any ? never[] : A[C] extends (...args: infer T) => any ? T : never[] : A[C][];

export type PureReducer = () => void;

export type makeStore<State, Actions> =
  // Effects
  PickByValue<Actions, Function>
  &
  {
    // Reducers
    [k in keyof Actions as `on${Capitalize<string & k>}`]: Actions[k] extends (...args: infer I) => Observable<infer O> ? (state: State, payload: O) => State : (state: State, payload: Actions[k]) => State
  };

interface LoadingState<A> {
  code: keyof A;
  payload: any;
  status: boolean;
}

export abstract class BaseStore<State, A> {

  private readonly actions: Map<string, Subject<{ name: string, payload?: any }>> = new Map();

  private get effects(): Effects<A> {
    return getEffectMetadata(this);
  }

  private get reducers(): Reducers<A> {
    return getReduceMetadata(this);
  }

  private _loading$ = new Subject<LoadingState<A>>();

  public get loading$(): Observable<LoadingState<A>> {
    return this._loading$.asObservable();
  }

  private _error$ = new Subject<Error>();

  get error$(): Observable<Error> {
    return this._error$.asObservable();
  }

  private readonly _store$: BehaviorSubject<State> = new BehaviorSubject<State>(
    // we need this in order to decouple initial state between instances
    JSON.parse(JSON.stringify(this.initialState))
  );

  public get state$(): Observable<State> {
    return this._store$;
  }

  constructor(private initialState: State) {


    const actions = [].concat(Object.keys(this.effects), Object.keys(this.reducers));

    const actionsSet = new Set<string>();

    actions.forEach((action) => actionsSet.add(action));

    actionsSet.forEach((key) => {

      this.actions.set(key, new Subject());

      const operator = BaseStore.getOperator(this.effects[key]?.strategy);


      this.actions.get(key).pipe(
        withLatestFrom(this._store$),
        tap(([{payload}]) => {
          this._loading$.next({
            payload: payload,
            status: true,
            code: key as keyof A,
          });
        }),
        operator(([{name, payload}]) => {
          return this[name](...payload).pipe(
            catchError((error) => {
              this._error$.next(error);
              return EMPTY;
            }),
            map((response) => {
              const reducer = `on${key[0].toUpperCase()}${key.slice(1)}`

              return this[this.reducers[reducer]](this._store$.getValue(), response);
            }),

            finalize(() => {
              this._loading$.next({
                payload: payload,
                status: false,
                code: key as keyof A,
              });
            })
          );
        }),

        catchError((error) => {
          console.error(error);
          this._error$.next(error);
          return EMPTY;
        })
      ).subscribe((s: State) => {
        this._store$.next(s);
      });
    });
  }

  select(projection: (s: State) => any) {
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

    const effect = action as string;
    const reducer = `on${capitalise(action as string)}`

    let a = effect;

    if (!this.actions.has(effect)) {
      if (!this.actions.has(reducer)) {
        throw new Error(`Cannot find action ${action}`);
      } else {
        a = reducer;
      }
    }

    this.actions.get(a).next({name: this.effects[action as string]?.functionName || 'noopEffect', payload});
  }

  private static noopEffect(payload: any) {
    return of(payload);
  }

  private static getOperator(effectElement: EffectStrategy) {
    if (effectElement === 'switchMap') {
      return switchMap;
    } else if (effectElement === 'concatMap') {
      return concatMap;
    } else {
      return mergeMap;
    }
  }
}

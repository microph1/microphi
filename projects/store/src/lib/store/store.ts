/* eslint-disable @typescript-eslint/ban-types,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call */
import { BehaviorSubject, EMPTY, Observable, of, Subject } from 'rxjs';
import { getReduceMetadata, Reducers } from '../reduce/reduce';
import { catchError, concatMap, filter, finalize, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Effects, EffectStrategy, getEffectMetadata } from '../effect/effect';
import { Falsey } from 'utility-types';

export type getPayloadFromActionType<A, C extends keyof A> = A[C] extends Function ? A[C] extends () => any ? never[] : A[C] extends (...args: infer T) => any ? T : never[] : A[C][];


export type makeStore<State, Actions> =
// Effects
  {
    [k in keyof Actions]: Actions[k] extends Falsey ? never : Effector<Actions[k]>;
  }
  &
  {
    // Reducers
    [k in keyof Actions as `on${Capitalize<string & k>}`]: Reducer<Actions[k], State>;
  };

type fn<RetType> = (...args: any[]) => Observable<RetType>;

type Effector<Action> = Action extends (...args: infer I) => infer O ? (...args: I) => O : never;

// export type Reducer<State, Action> = Action extends fn<infer O> ? (state: State, payload: O) => State : (state: State, payload: Action) => State;
export type Reducer<Action, S> = Action extends Falsey ? (state: S) => S : Action extends fn<infer O> ?  (state: S, payload: O) => S : (state: S, payload: Action) => S;


interface LoadingState<A> {
  code: keyof A;
  payload: any;
  status: boolean;
}


export abstract class Store<State, A> {

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    JSON.parse(JSON.stringify(this.initialState))
  );

  public get state$(): Observable<State> {
    return this._store$;
  }

  constructor(private initialState: State) {


    const actions: string[] = [].concat(Object.keys(this.effects), Object.keys(this.reducers));

    const actionsSet = new Set<string>();

    actions.forEach((action) => actionsSet.add(action));

    actionsSet.forEach((key) => {

      this.actions.set(key, new Subject());

      if (key === 'findOne') {

        console.log('getting operator type for', key, ': ', this.effects[key]?.strategy);
      }
      const operator = Store.getOperator(this.effects[key]?.strategy);


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

              return this[this.reducers[name]](this._store$.getValue(), response);
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
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Cannot find action ${action}`);
    }

    this.actions.get(action as string).next({name: this.effects[action as string]?.functionName || 'noopEffect', payload});
  }

  private static noopEffect(payload: any) {
    return of(payload);
  }

  private static getOperator(effectElement: EffectStrategy) {
    if (effectElement === 'mergeMap') {
      return mergeMap;
    } else if (effectElement === 'concatMap') {
      return concatMap;
    } else {
      return switchMap;
    }
  }
}


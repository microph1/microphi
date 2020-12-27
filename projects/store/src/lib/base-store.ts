import { BehaviorSubject, EMPTY, Observable, of, Subject } from 'rxjs';
import { getStoreMetadata, StoreOptions } from './store';
import { getReduceMetadata, Reducers } from './reduce';
import { catchError, concatMap, finalize, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Effects, EffectStrategy, getEffectMetadata } from './effects/effect';

export type EffectFn<P, R> = (args: P) => Observable<R>;
export type ReduceFn<P, S> = (s: S, args: P) => S;

export type Action<P, R, S> = P extends void ? {
  reduce: ReduceFn<R, S>
} : { effect: EffectFn<P, R>, reduce: ReduceFn<R, S> };

export interface Actions {
  [name: string]: (...args: any[]) => Observable<any>;
}

export type getPayloadFromActionType<A, C extends keyof A> = A[C] extends () => any ? never[] : A[C] extends (...args: infer T) => any ? T : never[];

// tslint:disable-next-line:ban-types
export type getResponseFromActionType<A extends Actions, C extends keyof A> = A[C] extends Function ? ReturnType<A[C]> extends Observable<infer T> ? T extends Array<infer R> ? R : [T] : never[] : never[];

export type Reducer<
  State extends {},
  A extends Actions,
  C extends keyof A
> = (state: State, payload: ReturnType<A[C]> extends Observable<infer T> ? T : ReturnType<A[C]>) => State;

export type Updater<A extends Actions, C extends keyof A> = A[C];


export type Reducer2<
  Store extends BaseStore<any, any>,
  C extends keyof _Actions,
  State = Store extends BaseStore<infer S, any> ? S : unknown,
  _Actions = Store extends BaseStore<any, infer A> ? A extends Actions ? A : unknown : unknown,
  ReturnFromEffect = _Actions[C] extends (...args: infer A) => infer P ? P extends Observable<infer T> ? T : P : never,
> = (state: State, payload: ReturnFromEffect) => State;


export abstract class BaseStore<
  State,
  A extends Actions,
  // T = Pick<BaseStore<any, any, any, any>, '_storeMetadata'>
> {


  _storeMetadata: StoreOptions;

  private actions: Map<keyof A, Subject<{ name: string, payload?: any }>> = new Map();

  private get storeMetadata(): StoreOptions {
    return getStoreMetadata(this);
  }

  private get effects(): Effects<A> {
    return getEffectMetadata(this);
  }

  private get reducers(): Reducers<A> {
    return getReduceMetadata(this);
  }

  private _loading$ = new Subject<{
    type: string,
    code: keyof A,
    payload: any,
    status: boolean
  }>();

  public get loading$(): Observable<{ type: string; code: keyof A; payload: any; status: boolean }> {
    return this._loading$.asObservable();
  }

  private _error$ = new Subject<Error>();

  get error$(): Observable<Error> {
    return this._error$.asObservable();
  }

  public store$: BehaviorSubject<State> = new BehaviorSubject(this.storeMetadata.initialState);

  constructor() {
    this._storeMetadata = this.storeMetadata;
    // console.log('effects', this.effects);
    // console.log('reducers', this.reducers);
    // console.log('store', this.storeMetadata);

    const actions = [].concat(Object.keys(this.effects), Object.keys(this.reducers));
    // console.log('actions', actions);

    const actionsSet = new Set<string>();

    actions.forEach((action) => actionsSet.add(action));
    // console.log('actions set', [...actionsSet]);

    actionsSet.forEach((key) => {

      // console.log('setting up action', key);
      this.actions.set(key, new Subject());

      const operator = this.getOperator(this.effects[key]?.strategy);


      // console.log('operator for', key, 'is', operator);
      this.actions.get(key).pipe(
        // tap(console.log),
        withLatestFrom(this.store$),
        tap(([{name, payload}]) => {
          // console.log('starting loading');
          this._loading$.next({
            payload: payload,
            status: true,
            code: key,
            type: key
          });
        }),
        operator(([{name, payload}, state]) => {
          // console.log('running effect', name, 'with payload', payload);
          return this[name](...payload).pipe(
            catchError((error) => {
              this._error$.next(error);
              return EMPTY;
            }),
            map((response) => {
              return this[this.reducers[key]](state, response);
            }),
            finalize(() => {
              this._loading$.next({
                payload: payload,
                status: false,
                code: key,
                type: key
              });
            })
          );
        }),
        catchError((error) => {
          console.error(error);
          this._error$.next(error);
          return EMPTY;
        })
      ).subscribe(this.store$);
    });
  }

  // public dispatch(code: Actions, payload?: any) {
  //   const _code = code as unknown as number;
  //   this.actions.get(_code).next({name: this.effects[_code]?.functionName || 'noopEffect', payload});
  // }

  // // @ts-ignore
  // public _dispatch<C extends ActionTypes>(action: C, payload?: Parameters<Store[C]>) {
  //   const code = this.storeMetadata.actions[action];
  //   this.dispatch(code, payload);
  // }

  dispatch<C extends keyof A>(
    action: C,
    ...payload: getPayloadFromActionType<A, C>
  ) {


    if (!this.actions.has(action)) {
      throw new Error(`Cannot find action ${action}`);
    }
    this.actions.get(action).next({name: this.effects[action]?.functionName || 'noopEffect', payload});
  }

  // dispatch<
  //   C extends keyof Actions,
  //   P = Actions[C] extends () => any ? never : Actions[C] extends (...args: infer T) => any ? T : never
  // >(action: C, payload?: P) {}

  reduce<
    C extends keyof A,
    R = A[C] extends (...args: any[]) => any ? ReturnType<A[C]> extends Observable<infer Return> ? Return : never : never,
    >(action: C, reducer?: (state: State, response: R) => State): State {

    // console.log('reducing', action, 'with reducer', reducer);
    // todo reducer is the function that needs to be called on reduce
    return undefined;
  }


  _reduce<C extends keyof A>(action: C, state: State, ...response: getResponseFromActionType<A, C>): State {
    // const reduceFn =

    // return this[action](state, [...response]);
    return undefined;
  }

  private noopEffect(payload: any) {
    return of(payload);
  }

  private getOperator(effectElement: EffectStrategy) {
    if (effectElement === 'switchMap') {
      return switchMap;
    } else if (effectElement === 'concatMap') {
      return concatMap;
    } else {
      return mergeMap;
    }
  }
}

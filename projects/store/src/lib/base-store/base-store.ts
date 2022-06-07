import { BehaviorSubject, EMPTY,  Observable, of, Subject } from 'rxjs';
import { getStoreMetadata, StoreOptions } from '../store';
import { getReduceMetadata, Reducers } from '../reduce';
import { catchError, concatMap, filter, finalize, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Effects, EffectStrategy, getEffectMetadata } from '../effects/effect';


export type Action<Params, ReturnType> = (...args: Params[]) => Observable<ReturnType>;

export type getPayloadFromActionType<A, C extends keyof A> = A[C] extends () => any ? never[] : A[C] extends (...args: infer T) => any ? T : never[];

export type Actions = {
  [name: string]: Action<unknown, unknown>;
}

export type getResponseFromActionType<A extends Actions, C extends keyof A> = A[C] extends Function ? ReturnType<A[C]> extends Observable<infer T> ? T extends Array<infer R> ? R : [T] : never[] : never[];

export type Reducer<
  State extends {},
  A extends Actions,
  C extends keyof A
  > = (state: State, payload: ReturnType<A[C]> extends Observable<infer T> ? T : ReturnType<A[C]>) => State;

export type Updater<A extends Actions, C extends keyof A> = (...args: Parameters<A[C]>) => ReturnType<A[C]> extends Observable<infer T> ? Observable<T> : never;


export abstract class BaseStore<State, A extends Actions> {

  private actions: Map<keyof A, Subject<{ name: string, payload?: any }>> = new Map();

  private get effects(): Effects<A> {
    return getEffectMetadata(this);
  }

  private get storeMetadata(): StoreOptions {
    return getStoreMetadata(this);
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

  private _store$: BehaviorSubject<State> = new BehaviorSubject<State>(this.storeMetadata.initialState);

  public get state$(): Observable<State> {
    return this._store$;
  }

  constructor() {

    // @ts-ignore
    const actions = [].concat(Object.keys(this.effects), Object.keys(this.reducers));

    const actionsSet = new Set<string>();

    actions.forEach((action) => actionsSet.add(action));

    actionsSet.forEach((key) => {

      this.actions.set(key, new Subject());

      const operator = this.getOperator(this.effects[key]?.strategy);


      // console.log('operator for', key, 'is', operator);
      // @ts-ignore
      this.actions.get(key).pipe(
        withLatestFrom(this._store$),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        tap(([{name, payload}]) => {
          // console.log('starting loading');
          this._loading$.next({
            payload: payload,
            status: true,
            code: key,
            type: key
          });
        }),
        operator(([{name, payload}]) => {
          // console.log('running effect', name, 'with payload', payload);
          // @ts-ignore
          return this[name](...payload).pipe(
            catchError((error) => {
              this._error$.next(error);
              return EMPTY;
            }),
            map((response) => {
              console.log('running reducer');
              // @ts-ignore
              const reduced = this[this.reducers[key]](this._store$.getValue(), response);
              console.log('state', reduced);
              return reduced;
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
      ).subscribe((s) => {
        // @ts-ignore
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

    if (!this.actions.has(action)) {
      throw new Error(`Cannot find action ${action}`);
    }

    // @ts-ignore
    this.actions.get(action).next({name: this.effects[action]?.functionName || 'noopEffect', payload});
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

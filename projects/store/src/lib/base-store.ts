import { BehaviorSubject, EMPTY, Observable, of, Subject } from 'rxjs';
import { getStoreMetadata, StoreOptions } from './store';
import { getReduceMetadata } from './reduce';
import { catchError, concatMap, finalize, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Effects, EffectStrategy, getEffectMetadata } from './effects/effect';
import { Reducers } from '@microphi/store';

export abstract class BaseStore<T extends {}, Actions = number> {

  private actions: Map<number, Subject<{name: string, payload?: any}>> = new Map();

  private get storeMetadata(): StoreOptions {
    return getStoreMetadata(this);
  }

  private get effects(): Effects {
    return getEffectMetadata(this);
  }

  private get reducers(): Reducers {
    return getReduceMetadata(this);
  }

  private _loading$ = new Subject<{
    type: string,
    code: number,
    payload: any,
    status: boolean
  }>();

  public get loading$(): Observable<{ type: string; code: number; payload: any; status: boolean }> {
    return this._loading$.asObservable();
  }

  private _error$ = new Subject<Error>();

  get error$(): Observable<Error> {
    return this._error$.asObservable();
  }

  public store$ = new BehaviorSubject(this.storeMetadata.initialState);

  constructor() {

    if (this.storeMetadata?.actions) {
      Object.keys(this.storeMetadata.actions).forEach((key) => {
        if (Number.isInteger(+key)) {
          const code = +key;

          this.actions.set(code, new Subject());

          const operator = this.getOperator(this.effects[code]?.strategy);

          this.actions.get(code).pipe(

            withLatestFrom(this.store$),
            tap(([{name, payload}]) => {
              this._loading$.next({
                payload: payload,
                status: true,
                code: code,
                type: this.storeMetadata.actions[key]
              });
            }),
            operator(([{name, payload}, state]) => {

              return this[name](payload).pipe(
                catchError((error) => {
                  this._error$.next(error);
                  return EMPTY;
                }),
                map((response) => {
                  return this[this.reducers[code]](state, response);
                }),
                finalize(() => {
                  this._loading$.next({
                    payload: payload,
                    status: false,
                    code: code,
                    type: this.storeMetadata.actions[key]
                  });
                }),
              );
            }),
            catchError((error) => {
              this._error$.next(error);
              return EMPTY;
            }),
          ).subscribe(this.store$);
        }
      });

    }


  }

  public dispatch(code: Actions, payload?: any) {
    const _code = code as unknown as number;
    this.actions.get(_code).next({name: this.effects[_code]?.functionName || 'noopEffect', payload});
  }

  public testDispatchTypings(payload?: Actions) {

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

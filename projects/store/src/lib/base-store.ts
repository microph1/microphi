import { getDebugger } from '@microgamma/loggator';
import { BehaviorSubject, Observable, Subject, Subscription, throwError } from 'rxjs';
import { getStoreMetadata, StoreOptions } from './store';
import { Actions, Action, REQUEST_SUFFIX, RESPONSE_SUFFIX } from './actions';
import { getReduceMetadata } from './reduce';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';

export abstract class BaseStore<T extends {}> implements OnDestroy {

  private logger = getDebugger(`microphi:BaseStore:${this.constructor.name}`);

  private readonly storeMetadata: StoreOptions;
  private readonly actionsMetadata: Actions<any>;

  private _state: T;
  private get state(): T {
    return this._state;
  }
  private set state(value: T) {
    this.logger('setting new state', value);
    this._state = value;
    this._store$.next(value);
    if (this.storeMetadata.useLocalStorage) {
      this.logger('saving on localStorage');
      localStorage.setItem(this.storeMetadata.name, JSON.stringify(value));
    }
  }

  private _store$: BehaviorSubject<T>;

  public get store$(): Observable<T> {
    return this._store$.asObservable();
  }

  private actions$ = new Subject<{
    type: string,
    payload: any
  }>();

  private _loading$ = new Subject<{
    type: string,
    code?: number,
    payload: any,
    status: boolean
  }>();

  get loading$(): Observable<{ type: string; code?: number; payload: any; status: boolean }> {
    return this._loading$.asObservable();
  }

  private _error$ = new Subject<{
    action: string,
    error: typeof Error
  }>();

  get error$(): Observable<{ action: string; error: typeof Error }> {
    return this._error$.asObservable();
  }

  private destroy$: Subject<any> = new Subject<any>();

  constructor() {

    this.storeMetadata = getStoreMetadata(this);
    this.logger('@Store', this.storeMetadata);

    this._store$ = new BehaviorSubject(this.storeMetadata.initialState);
    // dereference initial state so that is does not leak between instances
    this._state = Object.assign( {},  this.storeMetadata.initialState);
    this.logger('InitialState', this.state);

    this.actionsMetadata = new Actions(this.storeMetadata.actions);

    const reducerMetadata = getReduceMetadata(this);
    this.logger('Reducers', reducerMetadata);
    const remappedReducers = this.parseReducers(reducerMetadata);
    this.logger('remapped reducers', remappedReducers);


    const effectsMetadata = Reflect.getMetadata('@Effect', this) || {};
    this.logger('Effects', effectsMetadata);
    const remappedEffects = this.remapEffects(effectsMetadata);
    this.logger('remapped effects', remappedEffects);

    this.actions$.pipe(
      tap((action: Action) => {
        this._loading$.next({
          type: action.type,
          code: this.actionsMetadata.getActionCodeFromChild(action.type),
          payload: action.payload,
          status: action.type.endsWith('_REQUEST')
        });

      }),
      takeUntil(this.destroy$),
    ).subscribe( (action: Action) => {
      this.logger('got type', action);

      const type = action.type;

      // effects are associated with requests
      if (type.endsWith(REQUEST_SUFFIX)) {
        if (remappedEffects.hasOwnProperty(type)) {

          const effectName = remappedEffects[type];
          this.logger('should call', effectName);


          if (this[effectName] instanceof Function) {

            const retValue = this[effectName](action.payload) as Observable<any>;

            if (retValue instanceof Observable) {
              retValue.pipe(
                catchError((err) => {
                  console.error(`@Effect: ${effectName} thrown the following error`);
                  console.error(err);
                  this._loading$.next({
                    status: false,
                    payload: action.payload,
                    code: this.actionsMetadata.getActionCodeFromChild(action.type),
                    type: action.type,
                  });
                  this._error$.error({action: this.actionsMetadata.getActionCodeFromChild(action.type), error: err});
                  return throwError(err);
                }),
                takeUntil(this.destroy$)
              ).subscribe((value) => {
                this.logger('got data', value);

                this.actions$.next({
                  type: remappedEffects[effectName],
                  payload: value
                });
              });
            }

          }

        } else {
          // if there is no effect associated with this action then we can proceed calling the reducer associated
          this.actions$.next({
            type: type.replace(REQUEST_SUFFIX, RESPONSE_SUFFIX),
            payload: action.payload
          });

        }
      } else if (type.endsWith(RESPONSE_SUFFIX)) {

        const fn = remappedReducers[action.type];
        this.logger('should call fn', fn);

        if (this[remappedReducers[action.type]]) {
          try {
            this.state = this[remappedReducers[action.type]](this.state, action.payload);
          } catch (e) {

            // we don't need to stop loading here at it has already been stopped

            console.error(`@Reduce ${fn} thrown an error`, e);
            this._error$.error({action: this.actionsMetadata.getActionCodeFromChild(action.type), error: e});
          }
        }

      }

    }, (err) => {
      this.logger('got error', err);
      // TODO should handle the error or should we change loading$ to a more generic status$ so we can pass altogether
      // loadings and errors events?
      this._error$.error(err);
      console.error(err);
    });

  }

  public dispatch(type: number, payload?: any) {

    const requestAction = this.actionsMetadata.getActionsByCode(type).request;
    this.logger('dispatching type', requestAction);

    this.actions$.next({type: requestAction, payload});
  }

  private parseReducers(reducers) {
    const remappedReducers = {};

    Object.keys(reducers).forEach((action) => {
      if (+action >= 0) {
        const _action: number = Number(action);
        // this.logger('remapping', type, 'to');
        const realAction = this.actionsMetadata.getActionsByCode(_action).response;
        // this.logger('real type to map to', realAction);
        remappedReducers[realAction] = reducers[action];
      }
    });

    return remappedReducers;
  }

  private remapEffects(effectsMetadata: {}) {
    const remappedEffects = {};

    Object.keys(effectsMetadata).forEach((action) => {
      // effects should react to REQUEST events

      if (+action >= 0) {
        const _action = Number(action);

        const realAction = this.actionsMetadata.getActionsByCode(_action).request;

        remappedEffects[realAction] = effectsMetadata[action];
        // mapping the effect function so that it can return a response type
        remappedEffects[effectsMetadata[action]] = this.actionsMetadata.getActionsByCode(_action).response;
      }
    });

    return remappedEffects;
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

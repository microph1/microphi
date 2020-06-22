import { getDebugger } from '@microgamma/loggator';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { getStoreMetadata, StoreOptions } from './store';
import { Actions, Action, REQUEST_SUFFIX, RESPONSE_SUFFIX } from './actions';
import { getReduceMetadata } from './reduce';
import { takeUntil, tap } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';

// Looks like passing the status on each effect/reducer is not needed: developer can always refer to this.state
// TODO: Remove the state argument to effect/reducer

export abstract class BaseStore<T extends {}> implements OnDestroy {

  private logger = getDebugger(`microphi:BaseStore:${this.constructor.name}`);

  private readonly storeMetadata: StoreOptions;
  private readonly actionsMetadata: Actions<any>;

  private _state: T;
  protected get state(): T {
    return this._state;
  }
  protected set state(value: T) {
    this._state = value;
    this.store$.next(value);
    if (this.storeMetadata.useLocalStorage) {
      this.logger('saving on localStorage');
      localStorage.setItem(this.storeMetadata.name, JSON.stringify(value));
    }
  }

  protected store$: BehaviorSubject<T>;

  protected actions$ = new Subject<{
    type: string,
    payload: any
  }>();

  public loading$ = new Subject<{
    type: string,
    code?: number,
    payload: any,
    status: boolean
  }>();

  public error$ = new Subject<{
    action: string,
    error: typeof Error
  }>();

  private destroy$: Subject<any> = new Subject<any>();

  constructor() {

    this.storeMetadata = getStoreMetadata(this);
    this.logger('@Store', this.storeMetadata);

    this.store$ = new BehaviorSubject(this.storeMetadata.initialState);
    this._state = this.storeMetadata.initialState;
    this.logger('InitialState', this.state);

    this.actionsMetadata = new Actions(this.storeMetadata.actions);
    console.log('create new action metadata', this.actionsMetadata);

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
        this.loading$.next({
          type: action.type,
          code: this.actionsMetadata.getActionCodeFromChild(action.type),
          payload: action.payload,
          status: action.type.endsWith('_REQUEST')
        });

      }),
      takeUntil(this.destroy$),
    ).subscribe(async (action: Action) => {
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
                takeUntil(this.destroy$)
              ).subscribe((value) => {
                this.logger('got data', value);

                this.actions$.next({
                  type: remappedEffects[effectName],
                  payload: value
                });
              }, (err) => {
                this.logger('got error', err);
                // dispatch type with error

                this.error$.thrownError({action: type, error: err});

              });
            }

          }

        } else {
          // if there is no effect associated with this action then we can proceed calling the reducer associated
          this.actions$.next({
            type: type.replace('_REQUEST', '_RESPONSE'),
            payload: action.payload
          });

        }
      } else if (type.endsWith(RESPONSE_SUFFIX)) {

        const fn = remappedReducers[action.type];
        this.logger('should call fn', fn);

        if (this[remappedReducers[action.type]]) {
          const newState = await this[remappedReducers[action.type]](action.payload);
          this.logger('newState', newState);

          this.state = newState;

        }

      }

    }, (err) => {
      this.logger('got error', err);
      // TODO should handle the error or should we change loading$ to a more generic status$ so we can pass altogether
      // loadings and errors events?
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

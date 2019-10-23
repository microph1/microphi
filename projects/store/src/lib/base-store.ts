import { getDebugger } from '@microgamma/loggator';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { getStoreMetadata, StoreOptions } from './store';
import { Actions } from './actions';
import { ActionsMetadata, getActionMetadata } from './action';
import { getReduceMetadata } from './reduce';
import { tap } from 'rxjs/operators';

// Looks like passing the status on each effect/reducer is not needed: developer can always refer to this.state
// TODO: Remove the state argument to effect/reducer

export abstract class BaseStore<T extends {}> {
  private logger = getDebugger(`microphi:BaseStore:${this.constructor.name}`);

  public loading$ = new Subject<{
    type: string,
    payload: any,
    status: boolean
  }>();

  private readonly storeMetadata: StoreOptions;

  private _state: T;

  private readonly actionsMetadata: ActionsMetadata;

  public error$ = new Subject<{
    action: string,
    error: typeof Error
  }>();

  get state(): T {
    return this._state;
  }

  set state(value: T) {
    this._state = value;
    this.store$.next(value);
    localStorage.setItem(this.storeMetadata.name, JSON.stringify(value));
  }

  protected actions$ = new Subject();

  protected store$: BehaviorSubject<T>;

  constructor() {

    this.storeMetadata = getStoreMetadata(this);
    this.logger('@Store', this.storeMetadata);

    this.store$ = new BehaviorSubject(this.storeMetadata.initialState);
    this._state = this.storeMetadata.initialState;
    this.logger('InitialState', this.state);

    this.actionsMetadata = getActionMetadata(this);
    this.logger('Actions', this.actionsMetadata);

    const reducerMetadata = getReduceMetadata(this);
    this.logger('Reducers', reducerMetadata);
    const remappedReducers = this.parseReducers(reducerMetadata);
    this.logger('remapped reducers', remappedReducers);


    const effectsMetadata = Reflect.getMetadata('@Effect', this) || {};
    this.logger('Effects', effectsMetadata);
    const remappedEffects = this.remapEffects(effectsMetadata);
    this.logger('remapped effects', remappedEffects);

    this.actions$.pipe(
      tap((action: Actions) => {
        if (action.type.includes('_REQUEST')) {
          this.logger('starting loading');
          this.loading$.next({type: action.type, payload: action.payload, status: true});
        }
      }),
      tap((action: Actions) => {
        if (action.type.includes('_RESPONSE')) {
          this.logger('stopping loading');
          this.loading$.next({type: action.type, payload: action.payload, status: false});
        }
      })
    ).subscribe(async (action: Actions) => {
      this.logger('got type', action);

      const type = action.type;

      // effects are associated with requests
      if (type.includes('_REQUEST')) {
        if (remappedEffects.hasOwnProperty(type)) {

          const effectName = remappedEffects[type];
          this.logger('should call', effectName);

          // TODO use .toPromise to trick subscription/unsubscription hassle
          try {
            const resp = await (this[effectName](this.state, action.payload) as Observable<any>).toPromise();
            // pass response down triggering type to alert data arrived

            this.logger('got data', resp);

            this.actions$.next({
              type: remappedEffects[effectName],
              payload: resp
            });

          } catch (err) {
            this.logger('got error', err);
            // dispatch type with error

            this.error$.next({action: type, error: err});


            // TODO: to swallow or not to shallow?
            // throw e;
          }

        } else {
          // if there is no effect associated with this action then we can proceed calling the reducer associated
          this.actions$.next({
            type: type.replace('_REQUEST', '_RESPONSE'),
            payload: action.payload
          });

          this.loading$.next({type: type, payload: action.payload, status: false});
        }
      } else if (type.includes('_RESPONSE')) {

        const fn = remappedReducers[action.type];
        this.logger('should call fn', fn);

        if (this[remappedReducers[action.type]]) {
          // TODO since we may not need the state in the reducer better to switch the order fo the arguments
          const newState = await this[remappedReducers[action.type]](this.state, action.payload);
          this.logger('newState', newState);
          if (newState) {
            this.state = newState;
          }
        }

      }

    }, (err) => {
      this.logger('got error', err);
      this.loading$.next({type: 'GENERAL_ERROR', payload: err, status: false});
      // TODO should handle the error or should we change loading$ to a more generic status$ so we can pass altogether
      // loadings and errors events?
    });

  }

  public dispatch(type, payload?) {
    // TODO not sure we should extrapolate the request here
    const requestAction = this.actionsMetadata[type].request;
    this.logger('dispatching type', requestAction);
    // instead should dispatch a request

    this.actions$.next({type: requestAction, payload});
  }

  public getRequestFromAction(actionType) {
    return this.actionsMetadata[actionType].request;
  }

  public getResponseFromAction(actionType) {
    return this.actionsMetadata[actionType].response;
  }

  private parseReducers(reducers) {
    const remappedReducers = {};

    Object.keys(reducers).forEach((action) => {
      if (+action >= 0) {
        // this.logger('remapping', type, 'to');
        const realAction = this.actionsMetadata[action].response;
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

        const realAction = this.actionsMetadata[action].request;

        remappedEffects[realAction] = effectsMetadata[action];
        // mapping the effect function so that it can return a response type
        remappedEffects[effectsMetadata[action]] = this.actionsMetadata[action].response;
      }
    });

    return remappedEffects;
  }

  public getActionName(type: number) {
    return this.actionsMetadata[type];
  }
}

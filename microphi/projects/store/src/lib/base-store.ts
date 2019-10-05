import { Log } from '@microgamma/loggator';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { StoreMetadata } from './store';
import { Actions, RestActions } from './actions';
import { tap } from 'rxjs/operators';

export abstract class BaseStore<T extends {}> {

  @Log()
  private _log;

  public loading$ = new BehaviorSubject<boolean>(false);

  private readonly storeMetadata: StoreMetadata;

  private _state: T;

  get state(): T {
    return this._state;
  }

  set state(value: T) {
    this.store$.next(value);
    localStorage.setItem(this.storeMetadata.name, JSON.stringify(value));
    this._log.d('nexting with', value);
    this._state = value;
  }

  public actions$ = new Subject();

  public store$: BehaviorSubject<T>;

  protected constructor() {
    this.storeMetadata = Reflect.getMetadata('Store', this.constructor);
    this._log.d('@Store', this.storeMetadata);

    this.store$ = new BehaviorSubject(this.storeMetadata.initialState);
    this._state = this.storeMetadata.initialState;
    this._log.d('InitialState', this.state);

    const actionsMetadata = Reflect.getMetadata('Actions', this.constructor);
    this._log.d('@Actions', actionsMetadata);

    const reducerMetadata = Reflect.getMetadata('Reducer', this);
    this._log.d('@Reducer', reducerMetadata);

    const effectsMetadata = Reflect.getMetadata('@Effect', this);
    this._log.d('@Effect', effectsMetadata);
    /*
      effectsMetadata is something like the following
      { REQUEST: ["requestAuth"] }
     */

    this.actions$.pipe(
      tap(({event}) => {

        if (event === RestActions.REQUEST) {
          this.loading$.next(true);
        } else {
          this.loading$.next(false);
        }

      })
    ).subscribe(async (action: Actions) => {
      this._log.d('got action', action);

      const event = action.event;

      if (effectsMetadata.hasOwnProperty(event)) {
        const effects = effectsMetadata[event];
        effects.forEach((effectName) => {
          this[effectName](this.state, action.payload);
        });
      }

      // then run reducers
      if (this[reducerMetadata[action.event]]) {
        const newState = await this[reducerMetadata[action.event]](this.state, action.payload);
        this._log.d('newState', newState);
        this.state = newState;
      }


    }, (err) => {
      this._log.d('got error', err);
      this.loading$.next(false);
    })


  }

  dispatch(event, payload) {
    this.actions$.next({event, payload});
  }
}

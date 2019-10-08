import { getDebugger } from '@microgamma/loggator';
import { BehaviorSubject, Subject } from 'rxjs';
import { StoreMetadata } from './store';
import { Actions } from './actions';

const d = getDebugger('microphi:BaseStore');

export abstract class BaseStore<T extends {}> {

  private readonly storeMetadata: StoreMetadata;

  private _state: T;

  get state(): T {
    return this._state;
  }

  set state(value: T) {
    this.store$.next(value);
    localStorage.setItem(this.storeMetadata.name, JSON.stringify(value));
    this._state = value;
  }

  protected actions$ = new Subject();

  protected store$: BehaviorSubject<T>;

  constructor() {
    this.storeMetadata = Reflect.getMetadata('Store', this.constructor);
    d('@Store', this.storeMetadata);

    this.store$ = new BehaviorSubject(this.storeMetadata.initialState);
    this._state = this.storeMetadata.initialState;
    d('InitialState', this.state);

    const actionsMetadata = Reflect.getMetadata('Actions', this.constructor);
    d('Actions', actionsMetadata);

    const reducerMetadata = Reflect.getMetadata('Reducer', this);
    d('Reducers', reducerMetadata);

    const effectsMetadata = Reflect.getMetadata('@Effect', this) || {};
    d('Effects', effectsMetadata);
    /*
      effectsMetadata is something like the following
      { REQUEST: ["requestAuth"] }
     */

    this.actions$.subscribe(async (action: Actions) => {
      d('got action', action);

      const type = action.type;

      if (effectsMetadata.hasOwnProperty(type)) {
        const effects = effectsMetadata[type];
        effects.forEach((effectName) => {
          this[effectName](this.state, action.payload);
        });
      }

      // then run reducers
      if (this[reducerMetadata[action.type]]) {
        // TODO since we may not need the state in the reducer better to switch the order fo the arguments
        const newState = await this[reducerMetadata[action.type]](this.state, action.payload);
        d('newState', newState);
        this.state = newState;
      }


    }, (err) => {
      d('got error', err);
    });

  }

  dispatch(type, payload?) {
    this.actions$.next({type, payload});
  }
}

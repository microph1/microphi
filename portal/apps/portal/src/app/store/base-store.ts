import { Log } from '@microgamma/loggator';
import { BehaviorSubject, Subject } from 'rxjs';
import { StoreMetadata } from './store';
import { Actions } from './actions';


export class BaseStore {

  @Log()
  private $l;

  private readonly storeMetadata: StoreMetadata;

  private _state;

  get state() {
    return this._state;
  }

  set state(value) {
    this.store$.next(value);
    localStorage.setItem(this.storeMetadata.name, JSON.stringify(value));
    this.$l.d('nexting with', value);
    this._state = value;
  }

  public actions$ = new Subject();

  public store$;

  constructor() {
    this.storeMetadata = Reflect.getMetadata('Store', this.constructor);
    this.$l.d('@Store', this.storeMetadata);

    this.store$ = new BehaviorSubject(this.storeMetadata.initialState);
    this._state = this.storeMetadata.initialState;

    const actionsMetadata = Reflect.getMetadata('Actions', this.constructor);
    this.$l.d('@Actions', actionsMetadata);

    const reducerMetadata = Reflect.getMetadata('Reducer', this);
    this.$l.d('@Reducer', reducerMetadata);

    const effectsMetadata = Reflect.getMetadata('@Effect', this);
    this.$l.d('@Effect', effectsMetadata);

    this.actions$.pipe().subscribe(async (action: Actions) => {
      this.$l.d('got action', action);


      // first run effects
      const actionType = action.event;

      // should return an observable
      if (effectsMetadata[actionType]) {
        const effects = effectsMetadata[actionType];
        for (const effect of effects) {
          this[effect](this.state, action.payload);
        }
      }


      // then run reducers
      if (this[reducerMetadata[action.event]]) {
        const newState = await this[reducerMetadata[action.event]](this.state, action.payload);
        this.$l.d('newState', newState);
        this.state = newState;
      }


    }, (err) => {
      this.$l.d('got error', err);
    })


  }

  dispatch(event, payload) {
    // this.em.emit(event, payload);
    this.actions$.next({event, payload});
  }
}

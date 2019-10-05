import { Log } from '@microgamma/loggator';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { StoreMetadata } from './store';
import { Actions } from './actions';
import { tap } from 'rxjs/operators';
import { RestActions } from '../../../microphi/src/app/services/auth/auth.store';


export abstract class BaseStore {

  @Log()
  private $l;

  public loading$ = new BehaviorSubject<boolean>(false);

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
    /*
      effectsMetadata is something like the following
      { REQUEST: ["requestAuth"] }
     */

    const functionsToPipe = [];

    Object.keys(effectsMetadata).forEach((effectName) => {
      // functions that need to be piped
      const functionNames: string[] = effectsMetadata[effectName];

      functionNames.forEach((fn) => {
        // each function would return an observable so we can encapsulate into a mergeMap

        functionsToPipe.push(tap(({event, payload}) => {

          this.$l.d('running effect for', event, payload);

          if (event === effectName) {
            return this[fn](this.state, payload);
          }

          return of({event, payload});

        }));
      });
    });


    this.actions$.pipe(
      tap(({event}) => {

        if (event === RestActions.REQUEST) {
          this.loading$.next(true);
        } else if (event === RestActions.RESPONSE) {
            this.loading$.next(false);
        } else if (event === RestActions.ERROR) {
          this.loading$.next(false);
        }

      }),
      // effects are piped and we're assuming that they will return an Observable
      ...functionsToPipe
    ).subscribe(async (action: Actions) => {
      this.$l.d('got action', action);

      // then run reducers
      if (this[reducerMetadata[action.event]]) {
        const newState = await this[reducerMetadata[action.event]](this.state, action.payload);
        this.$l.d('newState', newState);
        this.state = newState;
      }


    }, (err) => {
      this.$l.d('got error', err);
      this.loading$.next(false);
    })


  }

  dispatch(event, payload) {
    // this.em.emit(event, payload);

    this.actions$.next({event, payload});
  }
}

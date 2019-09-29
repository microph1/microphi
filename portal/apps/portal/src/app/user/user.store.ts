import { Injectable } from '@angular/core';
import { configureStore, createAction, createReducer } from 'redux-starter-kit';
import { getDebugger, Log } from '@microgamma/loggator';
import { BehaviorSubject } from 'rxjs';

const d = getDebugger('microphi:store');


interface ActionOf<T extends {}> {
  (payload: T): Actions<T>
}

class Actions<T> {
  type: string;
  payload: T;

  toString(): string {
    return this.type;
  }
}


function Action() {
  return (target, key) => {
    d('action decorator for', key);

    const action = createAction(key);

    const actions = Reflect.getMetadata('Actions', target) || {};

    actions[key] = action;
    d('actions created', actions);

    target[key] = action;

    Reflect.defineMetadata(`Actions`, actions, target);

  }
}

function Store(options: { initialState: any; name: string }) {
  d('options', options);
  return (target) => {
    d('running store decorator');

    Reflect.defineMetadata('Store', options, target);
  }
}

function Reduce(onAction: string) {
  return (target, key, descriptor) => {

    const originalFn = descriptor.value;

    const reducer = Reflect.getMetadata('Reducer', target) || {};
    

    
    descriptor.value = (...args) => {
      d('running reducer', key);
      return originalFn(...args);
    };

    reducer[onAction] = descriptor.value;

    Reflect.defineMetadata('Reducer', reducer, target);
    
    return descriptor;
  };
}

@Injectable()
@Store({
  name: 'userStore',
  initialState: +localStorage.getItem('counterState') || 0
})
export class UserStore {

  @Log()
  private $l;
  public store;

  public store$;

  @Action()
  static INCREMENT: ActionOf<number>;

  @Action()
  static DECREMENT: ActionOf<number>;


  @Reduce('INCREMENT')
  private increment(state, action) {
    d(state, action);
    return state + action.payload;
  }

  @Reduce('DECREMENT')
  private decrement(state, action) {
    d(state, action);
    return state - action.payload;
  }

  constructor() {
    const storeMetadata = Reflect.getMetadata('Store', this.constructor);
    this.$l.d('@Store', storeMetadata);

    this.store$ = new BehaviorSubject(storeMetadata['initialState']);

    const actionsMetadata = Reflect.getMetadata('Actions', this);
    this.$l.d('@Actions', actionsMetadata);

    const reducerMetadata = Reflect.getMetadata('Reducer', this);
    this.$l.d('@Reducer', reducerMetadata);
    
    const reducer = createReducer(storeMetadata['initialState'], reducerMetadata);

    this.store = configureStore({
      reducer: reducer
    });

    this.store.subscribe(() => {
      const state = this.store.getState();
      this.store$.next(state);
      localStorage.setItem('counterState', state);
    });
  }
}

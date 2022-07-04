/* eslint-disable */
import { Observable, of, Subject } from 'rxjs';
import { Falsey } from 'utility-types';
import { map } from 'rxjs/operators';
import 'reflect-metadata';

describe('experiments with new ways of thinking a state manager', () => {

  type functionKeys<T> = {
    [k in keyof T]: T[k] extends Falsey ? never : T[k] extends (...args: any[]) => any ? k : never
  }[keyof T];


  type makeStore<State, Actions extends object> =
    Pick<Actions, functionKeys<Actions>>
    &
    {
      // Reducers
      [k in keyof Actions as `on${Capitalize<string & k>}`]: Reducer<Actions[k], State>;
    }

  type fn<RetType> = (...args: any[]) => Observable<RetType>;


  type _Reducer<Action, S> = Action extends Falsey ? (state: S) => S : Action extends fn<infer O> ? (state: S, payload: O) => S : (state: S, payload: Action) => S;
  type Reducer<Action, S> = Action extends fn<infer O> ? (state: S, payload: O) => S :
    Action extends (...args: any[]) => infer O ? (state: S, payload: O) => S : (state: S) => S;

  // type getEffects<T> =

  type getEffectNames<T> = {
    [k in keyof T]: T[k] extends (...args: any[]) => Observable<any> ? k :
      T[k] extends (...args: any[]) => void ? k : never;
  }[keyof T]

  type getEffects<T> = Pick<T, getEffectNames<T>>

  type getState<T> = {
    [k in keyof T]: T[k] extends (...args: any[]) => Observable<any> ? never :
      T[k] extends (...args: any[]) => infer S ? S : never;
  }[keyof T]


  const state: getState<MyActions> = {
    items: []
  }


  // eslint-disable-next-line @typescript-eslint/ban-types
  function StoreFactory<
    B extends new (...args: any[]) => {},
    T = InstanceType<B>, // B extends new (...args: any[]) => infer A ? A : never,
    Actions = getEffects<T>,
    State = getState<T>,
    A = T extends makeStore<any, infer Act> ? Act : never,
  >(base: B) {

    // can parse these to define actions names
    const methods = Object.getOwnPropertyNames(base.prototype);
    console.log({methods});

    const metadata = Reflect.getOwnMetadataKeys(base.prototype);
    console.log('from base', {metadata});

    const effects = Reflect.getMetadata('effect', base.prototype);
    console.log({effects});

    const reducers = Reflect.getMetadata('reduce', base.prototype);
    console.log({reducers});


    return class {
      private readonly base = new base();

      private readonly pipelines = new Map<string, Subject<{ func: string, payload: unknown }>>();

      state$: Observable<State> = new Observable<State>();

      constructor(...args: any[]) {}

      dispatch<K extends keyof Actions>(action: K, ...payload: getPayload<Actions[K]>) {
        console.log(action);
      }

      _dispatch<K extends keyof A>(a: K) {}
    };
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  type getPayload<Action> = Action extends Function ? Action extends () => any ? never[] : Action extends (...args: infer T) => any ? T : never[] : Action[];

  type getRetType<F> = F extends fn<infer O> ? O : never;

  interface MyState {
    items: string[];
  }

  interface _MyActions {
    // an action that does not have an effect and its reducer does not have a payload
    increment: () => void,
    // an action that does not have an effect and its reducer does have a payload
    increment2: () => Observable<number>,
    // an action that does have an effect without params and its reducer has string[] as payload
    findAll: () => Observable<string[]>; //Action<void, string[]>;
    // an action that does have an effect with params `name: string` and its reducer has string[] as payload
    findOne: (name: string) => Observable<string>;
  }




  function effect(strategy: 'switchMap' | 'concatMap' | 'mergeMap' = 'switchMap'): MethodDecorator {
    return (target, propertyKey, descriptor) => {
      const effects = Reflect.getMetadata('effect', target) || [];
      effects.push({
        effect: propertyKey,
        strategy,
      });
      return Reflect.defineMetadata('effect', effects, target);    }
  }

  function reduce(): MethodDecorator {
    return (target, propertyKey: string, descriptor) => {
      const reducers = Reflect.getMetadata('reduce', target) || [];
      const effectName = propertyKey.split('on')[1];
      console.log(effectName.charAt(0).toLowerCase() + effectName.slice(1));
      reducers.push(propertyKey);
      return Reflect.defineMetadata('reduce', reducers, target);
    }
  }

  class MyActions implements makeStore<MyState, _MyActions> {
    increment(): void {
    }

    increment2(): Observable<number> {
      return of(0);
    }

    onIncrement(state: MyState): MyState {
      return undefined
    }

    onIncrement2<O>(state: MyState, payload: number): MyState {
      return undefined;
    }


    @effect()
    findAll(): Observable<string[]> {
      return undefined;
    }

    @reduce()
    onFindAll<O>(state: MyState, payload: string[]): MyState {
      return undefined;
    }

    @effect()
    findOne(name: string): Observable<string> {
      return undefined;
    }

    @reduce()
    onFindOne<O>(state: MyState, payload: string): MyState {
      return undefined;
    }
  }

  class MyStore extends StoreFactory(MyActions) {

    // items$ = this.state$.pipe(map(({items}) => items));

    constructor() {
      super();

      // set initial state here, if you like

    }

  }


  //
  let store: MyStore;

  beforeEach(() => {
    store = new MyStore();
  });

  it('should ', () => {
    expect(true).toBeTruthy();


    // store.dispatch('');
    // store._dispatch();
    // store.dispatch('findOne', 'joy');
    console.log(store.constructor.name);


  });

});

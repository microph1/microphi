/* eslint-disable */
import { BehaviorSubject, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { getPayloadFromActionType } from '@microphi/store';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { $Keys } from 'utility-types';

xdescribe('experiment 2', () => {

  type Class = new (...args: any[]) => {};

  interface LoadingState {
    status: boolean;
    action: string;
    payload: any;
  }

  function StoreFactory<E extends Class,
    R extends Class,
    S,
    IE = InstanceType<E>,
    IR = InstanceType<R>,
    >(effects: E, reducers: R, state: S) {

    const effectNames = (Object.getOwnPropertyNames(effects.prototype))
      .filter((m) => typeof effects.prototype[m] === 'function')
      .filter((m) => m !== 'constructor') as $Keys<IE & object>[];
    console.log({effectNames});

    const reducerNames = (Object.getOwnPropertyNames(reducers.prototype) as $Keys<IE & object>[])
      .filter((m) => typeof reducers.prototype[m] === 'function')
      .filter((m) => m !== 'constructor');
    console.log({reducerNames});

    // this will be common to all instances
    const actions = new Set<keyof IE>(
      effectNames.concat(reducerNames)
    );
    console.log({actions});

    return class {

      private loading$: Subject<LoadingState> = new Subject<LoadingState>();

      private actions: Map<keyof IE, Subject<any>> = new Map();

      constructor(private e: IE, private r: IR) {
        console.log('initial state is', state);

        actions.forEach((a) => {
          console.log('creating Subject for action', a);
          const actionSubject = new Subject<{ action: string; payload: unknown; }>();

          actionSubject.pipe(
            withLatestFrom(this._state$),
            tap(([payload]) => {
              console.log('action dispatched with payload', payload);
              console.log('loading will start now!');
              this.loading$.next({
                action: a as string,
                payload,
                status: true
              });
            }),
            switchMap(([payload, state]) => {
              return (this.e[a] as unknown as Function).apply(this.e, payload).pipe(
                map((response) => {
                  // @ts-ignore
                  return (this.r[a] as unknown as Function).apply(this.r, [state, response]);
                }),
                // this tap needs to be here because we need the `payload`
                tap(() => {
                  console.log('loading stops now');
                  this.loading$.next({
                    action: a as string,
                    status: false,
                    payload
                  });
                }, () => {
                  console.log('loading stops now');
                  this.loading$.next({
                    action: a as string,
                    status: false,
                    payload
                  });
                })
              );
            })
          ).subscribe((state: S) => {
            console.log('new state is', state);
            this._state$.next(state);
          });

          this.actions.set(a, actionSubject);
        });

      }

      private _state$: BehaviorSubject<S> = new BehaviorSubject<S>(state);

      /**
       * Select a state field using a mapping function
       * @param fn mapping function
       * @example
       * store.select(({items}) => items);
       */
      select(fn: (s: S) => any) {
        return this._state$.pipe(
          map(fn)
        );
      }

      /**
       * Get the loading$ observable of a given action
       * @param a the action
       * @example
       * store.getLoadingFor('findAll')
       */
      getLoadingFor<K extends keyof IE>(a: K) {
        return this.loading$.pipe(
          filter(({action}) => {
            return action === a;
          })
        );
      }

      /**
       * Dispatch an action with the given payload.
       * @param action action to dispatch
       * @param payload payload to pass to the action
       *
       * @example
       *
       * interface IActions {
       *   findAll: () => string[];
       *   findOne: (name: string) => string;
       * }
       *
       * store.dispatch('findAll');
       * store.dispatch('findOne', 'alice');
       */
      dispatch<K extends keyof IE>(action: K, ...payload: getPayloadFromActionType<IE, K>) {
        console.log('dispatching action', action, 'with payload', payload);
        this.actions.get(action).next(payload);
      }
    };
  }

  type makeEffects<A> = {
    [k in keyof A]: A[k] extends (...args: infer I) => infer O ? (...args: I) => Observable<O> : void;
  }

  type returnType<T> = T extends (...args: any[]) => infer O ? O : string[];

  type makeReducers<A, S> = {
    [k in keyof A]: (state: S, payload: returnType<A[k]>) => S;
  }

  ///////////////////////////////////////////////////

  interface IActions {
    findAll: () => string[];
    selectOne: (name: string) => string;
  }

  interface IState {
    items: string[];
    selected: number;
  }

  class Effects implements makeEffects<IActions> {
    findAll(): Observable<string[]> {
      console.log('running findAll effect');
      return of(['alice', 'bob']);
    }

    selectOne(name: string): Observable<string> {
      return of(name);
    }

    private aPrivateEffect() {
    }

  }

  class Reducers implements makeReducers<IActions, IState> {
    findAll(state: IState, payload: string[]): IState {
      console.log('running findAll reducer');
      return {
        ...state,
        items: payload
      };
    }

    selectOne<k>(state: IState, payload: string): IState {

      return {
        ...state,
        selected: state.items.findIndex((s) => s === payload),
      };
    }

  }

  const initialState: IState = {
    items: ['Alice'],
    selected: undefined,
  };

  class MyStore extends StoreFactory(Effects, Reducers, initialState) {

    items$ = this.select(({items}) => items);

  }

  const store: MyStore = new MyStore(new Effects(), new Reducers());

  beforeEach(() => {

    store.items$.subscribe((items) => {
      console.log({items});
    });

    store.dispatch('findAll');
    store.dispatch('selectOne', 'test');
  });

  it('should pass', () => {
    expect(true).toBeTruthy();
  });

});

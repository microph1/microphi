import { Store, makeStore } from './store';
import { Reduce } from '../reduce/reduce';
import { Effect } from '../effect/effect';
import { delay, Observable, of, throwError } from 'rxjs';
import { expectObservable, expectObservableWithCallback } from '@microphi/test';

describe('store', () => {
  interface ItemsState {
    users: string[];
    selected?: [number, string];
  }

  interface ItemsActions {
    findAll: () => Observable<string[]>;
    findOne: (name: string) => Observable<string>;
    updateOne: (payload: { name: string, newName: string }) => Observable<{ name: string, newName: string }>;
    removeOne: (name: string) => Observable<boolean>;

    actionEffectThrows: () => Observable<number>;

    // this represents an action with only a reducer
    reducerThrows: { name: string };

    asyncEffect: (id: string, email: string) => Observable<string>;
    observerArgs: () => Observable<boolean>;
  }

  const initialState = {
    users: ['alice', 'bob']
  };


  class MyStore extends Store<ItemsState, ItemsActions> implements makeStore<ItemsState, ItemsActions> {

    public users$ = this.select(({users}) => users);

    public reduceSpy = jest.fn();
    public effectSpy = jest.fn();

    constructor() {
      super(initialState);
    }

    @Effect<ItemsActions>('findAll')
    public findAll() {
      this.effectSpy('payload');
      return of(['carl', 'denise']);
    };

    @Reduce<ItemsActions>('findAll')
    public onFindAll(state, payload) {
      this.reduceSpy(payload);
      return {
        users: [...state.users, ...payload]
      };
    };

    @Effect<ItemsActions>('findOne', 'concatMap')
    public findOne(name: string): Observable<string> {
      console.log('effect findOne', name);
      return of(name).pipe(
        delay(500),
      );
    }

    @Reduce<ItemsActions>('findOne')
    public onFindOne(state, name) {
      console.log('reducer findOne', name);
      const selectedIdx = state.users.findIndex((u) => u === name);
      return {
        ...state,
        selected: [selectedIdx, name]
      };
    };

    @Effect<ItemsActions>('updateOne')
    public updateOne(payload): Observable<{ name: string, newName: string }> {
      return of(payload);
    }

    @Reduce<ItemsActions>('updateOne')
    public onUpdateOne(state: ItemsState, {name, newName}: { name: string; newName: string }): ItemsState {
      const userIdx = state.users.findIndex((u) => u === name);
      state.users[userIdx] = newName;
      return state;

    };

    @Effect<ItemsActions>('observerArgs', 'switchMap')
    public observerArgs() {
      return of(true);
    };

    @Reduce<ItemsActions>('observerArgs')
    public onObserverArgs(state) {
      return state;
    };

    @Effect('switchMap')
    public asyncEffect(id, email) {
      return of('test');
    };

    @Reduce<ItemsActions>('asyncEffect')
    public onAsyncEffect(state, payload) {
      this.reduceSpy();
      return {
        ...state,
        items: payload
      };
    };

    @Effect<ItemsActions>('actionEffectThrows')
    public actionEffectThrows() {
      return throwError(new Error('Effect error'));
    }

    @Reduce<ItemsActions>('actionEffectThrows')
    onActionEffectThrows<O>(state: ItemsState, payload: number): ItemsState {
      return undefined;
    }

    @Effect<ItemsActions>('removeOne')
    removeOne(name: string): Observable<boolean> {
      return of(true);
    }

    @Reduce<ItemsActions>('removeOne')
    onRemoveOne<O>(state: ItemsState, payload: boolean): ItemsState {
      return state;
    }

    @Reduce<ItemsActions>('reducerThrows')
    onReducerThrows(state: ItemsState, payload: {name: string}): ItemsState {
      throw new Error('from reducer!');
    }

  }

  let store: MyStore;

  beforeEach(() => {
    store = new MyStore();

    // silent console.error
    jest.spyOn(console, 'error').mockImplementation();
  });

  it('should create', () => {
    expect(store).toBeTruthy();
  });

  describe('initial state', () => {

    let storeSecondInstance: MyStore;

    beforeEach(() => {
      storeSecondInstance = new MyStore();
    });

    it('should set initial state', () => {

      expectObservable(storeSecondInstance.state$).toEqual({
        users: ['alice', 'bob']
      });

    });

    it('should not be shared between different instances', () => {
      store.dispatch('updateOne', {name: 'bob', newName: 'bobo'});

      expectObservable(store.users$).toEqual(['alice', 'bobo']);
      expectObservable(storeSecondInstance.users$).toEqual(['alice', 'bob']);

    });

    it('should update initial state', () => {
      store.dispatch('updateOne', {name: 'alice', newName: 'joy'});
      expectObservable(store.users$).toEqual(['joy', 'bob']);

    });

  });

  describe('state mutations', () => {

    it('should find all users', () => {
      store.dispatch('findAll');
      expectObservable(store.users$).toEqual(['alice', 'bob', 'carl', 'denise']);
    });

    it('should find a user', () => {
      store.dispatch('findOne', 'bob');
      expectObservable(store.state$).toEqual({
        users: ['alice', 'bob'],
        selected: [1, 'bob']
      });
    });

    it('should update a user', () => {
      store.dispatch('updateOne', {
        name: 'bob',
        newName: 'robert'
      });
      expectObservable(store.users$).toEqual(['alice', 'robert']);
    });

    it('should call an effect and reduce the state', () => {

      store.dispatch('findAll');

      expectObservable(store.state$).toEqual({users: ['alice', 'bob', 'carl', 'denise']});
      expect(store.effectSpy).toHaveBeenCalledWith('payload');
      expect(store.reduceSpy).toHaveBeenCalledWith(['carl', 'denise']);

    });

    it('should call a reducer that does not have any effect', () => {
      store.dispatch('findOne', 'alice');

      expectObservable(store.state$).toEqual({users: ['alice', 'bob'], selected: [0, 'alice']});
    });

  });



  describe('handling concurrency', () => {

    fdescribe('default strategy mergeMap', () => {

      it('should run the effect every time the event is dispatched', () => {


        expectObservableWithCallback(({expectObservable}) => {
          store.dispatch('findOne', 'alice');
          store.dispatch('findOne', 'bob');

          expectObservable(store.state$).toBe('---- --- --- ');
        });

      });

    });

    xit('should handle async actions', (done) => {

      const payload = [{a: 1}, {b: 2}];

      store.state$.subscribe((state) => {
        expect(store.reduceSpy).toHaveBeenCalledTimes(1);
        done();
      });

      store.dispatch('asyncEffect', 'od', 'email');
      store.dispatch('asyncEffect', 'od', 'email');
      store.dispatch('asyncEffect', 'od', 'email');
      store.dispatch('asyncEffect', 'od', 'email');

      // testScheduler.run(({expectObservable}) => {
      //
      //   expectObservable(store.store$).toBe('a 1s b', {
      //     a: {
      //       items: [{a: 1}, {b: 2}]
      //     }
      //   });
      // });

    });

    xit('should handle dispatch of several actions at once', () => {

      store.state$.subscribe((state) => {
        console.log('got state', state);

      });
      //
      const payload = [{a: 1}, {b: 2}];
      store.dispatch('asyncEffect', 'id', 'email');
      store.dispatch('asyncEffect', 'id', 'email');

      // debugger;
      // store.dispatch(ItemsActions.GET_ALL, payload);
      // debugger;
      // store.dispatch(ItemsActions.ANOTHER_ACTION, payload);


      // testScheduler.run(({expectObservable}) => {
      //   expectObservable(store.store$).toBe('a ', {
      //     a: {
      //       items: [{a: 1}, {b: 2}]
      //     }
      //   });
      //
      //   debugger;
      //   store.dispatch(ItemsActions.ASYNC_ACTION, payload);
      //   debugger;
      //   store.dispatch(ItemsActions.GET_ALL, payload);
      //   debugger;
      //   store.dispatch(ItemsActions.ANOTHER_ACTION, payload);
      //
      // });
      //
      expect(store.reduceSpy).toHaveBeenCalledTimes(1);
    });

  });

  describe('error handling', () => {

    it('should get an error through the error subject (effect that throws)', (done) => {

      store.error$.subscribe((err) => {
        expect(err).toEqual(Error('Effect error'));
        done();
      });

      store.dispatch('actionEffectThrows');

    });

    it('should handle error from a reducer', () => {
      store.dispatch('reducerThrows', {name: 'name'})
    });

    // it('should get an error though the error subject (reducer that throws)', (done) => {

      // store.error$.subscribe((err) => {
      //   expect(err).toEqual(Error('from reducer!'));
      //   done();
      // });


      // store.dispatch('reducerThrows');

    // });

    // it('should not follow the error through the items$ stream', () => {
    //
    //   store.dispatch('actionEffectThrows');
    //   store.dispatch('findAll');
    //
    //   testScheduler.run(({expectObservable}) => {
    //
    //     const unsub = '^-------- !';
    //     expectObservable(store.items$, unsub).toBe('a--', {a: [{a: 1}]});
    //   });
    //
    // });
  });

  // xdescribe('create an empty store', () => {
  //   interface ItemsState {
  //     items: any[];
  //   }
  //
  //   enum ItemsActions {
  //     ACTION_ONE,
  //     ACTION_TWO,
  //     ACTION_THREE,
  //   }
  //
  //   @Store({
  //     actions: ItemsActions,
  //     name: 'MyStore',
  //     useLocalStorage: false,
  //     initialState: { items: [] },
  //   })
  //   class MyStore extends BaseStore<ItemsState> {
  //
  //     public items$ = this.store$.pipe(
  //       map((state) => {
  //         return state.items;
  //       })
  //     );
  //
  //     @Effect(ItemsActions.ACTION_THREE)
  //     public effectThatThrows() {
  //       return throwError(new Error('Effect error'));
  //     }
  //
  //     @Reduce(ItemsActions.ACTION_TWO)
  //     protected thisWillThrow() {
  //       console.log('calling method that will throw');
  //       throw new Error('my awesome error!');
  //     }
  //
  //     @Reduce(ItemsActions.ACTION_ONE)
  //     protected setState(state: ItemsState, items: any[]): ItemsState {
  //
  //       return {
  //         ...state,
  //         items: items
  //       };
  //
  //     }
  //   }
  //
  //   let store: MyStore;
  //
  //   beforeEach(() => {
  //     store = new MyStore();
  //   });
  //
  //   it('should create', () => {
  //     expect(store).toBeTruthy();
  //   });
  //
  //
  //
  //
  // });

  // xdescribe('create a store with effects and reducers', () => {
  //
  //   interface ItemsState {
  //     items: any[];
  //   }
  //
  //   enum ItemsActions {
  //     GET_ALL,
  //     ANOTHER_ACTION,
  //     ASYNC_ACTION,
  //   }
  //
  //   @Store({
  //     actions: ItemsActions,
  //     name: 'MyStore',
  //     useLocalStorage: false,
  //     initialState: { items: [] },
  //   })
  //   class MyStore extends BaseStore<ItemsState> {
  //     public items$ = this.store$.pipe(
  //       map((state) => {
  //         return state.items;
  //       })
  //     );
  //
  //     public reduceSpy = createSpy('reduceSpy');
  //     public effectSpy = createSpy('effectSpy');
  //
  //     @Effect(ItemsActions.ASYNC_ACTION)
  //     public onAsyncAction() {
  //       return of('hello').pipe(
  //         tap((message) => console.log('waiting for message', message)),
  //         delay(1000),
  //         tap((message) => console.log('got message', message)),
  //       );
  //     }
  //
  //     @Reduce(ItemsActions.ASYNC_ACTION)
  //     public asyncAction(state, payload) {
  //       console.log('reducing async action', payload);
  //       this.reduceSpy();
  //       return {
  //         ...state
  //       };
  //     }
  //
  //     @Effect(ItemsActions.GET_ALL)
  //     public onGetAll(payload) {
  //       this.effectSpy(payload);
  //       return of(payload);
  //     }
  //
  //     @Reduce(ItemsActions.GET_ALL)
  //     @Reduce(ItemsActions.ANOTHER_ACTION)
  //     public onGotAll(state, payload) {
  //       this.reduceSpy(payload);
  //       return {
  //         ...state,
  //         items: payload,
  //       };
  //     }
  //
  //     public dispatchGetAll(items: { [key: string]: string; }[]) {
  //
  //       super.dispatch(ItemsActions.GET_ALL, items);
  //     }
  //
  //   }
  //
  //   let store: MyStore;
  //
  //   beforeEach(() => {
  //     store = new MyStore();
  //
  //     store.dispatch(ItemsActions.GET_ALL, [{my: 'payload'}]);
  //
  //   });
  //
  //   it('should create', () => {
  //     expect(store).toBeTruthy();
  //   });
  //
  //   it('should run the effect', () => {
  //     expect(store.effectSpy).toHaveBeenCalledWith([{my: 'payload'}]);
  //   });
  //
  //   it('should run the reducer', () => {
  //     expect(store.reduceSpy).toHaveBeenCalledWith([{my: 'payload'}]);
  //
  //   });
  //
  //   it('should update the state', async(() => {
  //
  //     store.items$.subscribe((items) => {
  //       expect(items).toEqual([{my: 'payload'}]);
  //     }, fail).unsubscribe();
  //
  //   }));
  //
  //   it('should work with marble testing', () => {
  //     testScheduler.run(({ expectObservable }) => {
  //       const unsub = '^-------- !';
  //       expectObservable(store.items$, unsub).toBe('a-----', {a: [{my: 'payload'}]});
  //     });
  //   });
  //
  //   it('should use custom dispatch', () => {
  //     store.dispatchGetAll([{a: '1'}, {b: '2'}, {c: '3'}]);
  //
  //     testScheduler.run(({ expectObservable }) => {
  //       const unsub = '^-------- !';
  //       expectObservable(store.items$, unsub).toBe('a', {a: [{a: '1'}, { b: '2'}, {c: '3'}]});
  //
  //     });
  //   });
  //
  //   it('should be able to bind a reducer to one or more actions', () => {
  //     store.dispatch(ItemsActions.ANOTHER_ACTION, []);
  //     expect(store.reduceSpy).toHaveBeenCalledWith([]);
  //   });
  //
  //   it('should cancel any pending effect if same action is dispatched twice', () => {
  //
  //     store.dispatch(ItemsActions.ASYNC_ACTION);
  //     store.dispatch(ItemsActions.ASYNC_ACTION);
  //     expect(store.reduceSpy).toHaveBeenCalledTimes(1);
  //
  //   });
  //
  //
  //   xdescribe('loading', () => {
  //     it('should start loading when an async action is dispatched', () => {
  //       testScheduler.run(({expectObservable}) => {
  //
  //         expectObservable(store.loading$.pipe(
  //           filter((state) => state.code === 2),
  //           map((status) => status.status),
  //           tap(console.log)
  //         )).toBe('a 1s b', {
  //           a: {
  //             code: 2,
  //             payload: undefined,
  //             status: true,
  //             type: 'onAsyncAction'
  //           }
  //         });
  //       });
  //
  //     });
  //   });
  // });

});


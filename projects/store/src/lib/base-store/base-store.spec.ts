import { Store } from '../store';
import { Actions, BaseStore, Reducer, Updater } from './base-store';
import { Reduce } from '../reduce';
import { Effect } from '../effects/effect';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { expect } from '@angular/flex-layout/_private-utils/testing';
import { expectObservable } from '@microphi/test';
import createSpy = jasmine.createSpy;


fdescribe('base-store', () => {
  interface ItemsState {
    users: string[];
    selected?: [number, string];
  }

  interface ItemsActions extends Actions {
    findAll: () => Observable<string[]>;
    findOne: (name: string) => Observable<string>;
    updateOne: (payload: { name: string, newName: string }) => Observable<{ name: string, newName: string }>;
    removeOne: (name: string) => Observable<boolean>;

    actionEffectThrows: () => Observable<number>;
    reducerThrows: () => Observable<ItemsState>;

    asyncEffect: (id: string, email: string) => Observable<string>;
    observerArgs: () => Observable<boolean>;
  }

  const initialState = {
    users: ['alice', 'bob']
  };


  @Store({
    initialState,
  })
  class MyStore extends BaseStore<ItemsState, ItemsActions> {
    public users$ = this.state$.pipe(
      map(({users}) => users)
    );

    public reduceSpy = createSpy('reduceSpy');
    public effectSpy = createSpy('effectSpy');

    @Effect<ItemsActions>('findAll')
    public getAll: Updater<ItemsActions, 'findAll'> = () => {
      this.effectSpy('payload');
      return of(['carl', 'denise']);
    };

    // @Effect<ItemsActions>('findAll')
    // public getAllFireAction() {
    //   console.log('this function is called. here we should fire another action');
    // }

    @Reduce<ItemsActions>('findAll')
    public onGotAll: Reducer<ItemsState, ItemsActions, 'findAll'> = (state, payload) => {
      this.reduceSpy(payload);
      return {
        users: [...state.users, ...payload]
      };
    };

    @Reduce<ItemsActions>('findAll')
    public onGotAllA: Reducer<ItemsState, ItemsActions, 'findAll'> = (state, payload) => {
      this.reduceSpy(payload);
      return {
        users: [...state.users, ...payload]
      };
    };

    @Reduce<ItemsActions>('findOne')
    public onFindOne: Reducer<ItemsState, ItemsActions, 'findOne'> = (state, name) => {
      const selectedIdx = state.users.findIndex((u) => u === name);
      return {
        ...state,
        selected: [selectedIdx, name]
      };
    };

    @Reduce<ItemsActions>('updateOne')
    public updateUser: Reducer<ItemsState, ItemsActions, 'updateOne'> = (state, {name, newName}) => {
      const userIdx = state.users.findIndex((u) => u === name);
      state.users[userIdx] = newName;
      return state;

    };

    // todo refactor methods below
    @Effect<ItemsActions>('observerArgs', 'switchMap')
    public observeArgs: Updater<ItemsActions, 'observerArgs'> = () => {
      return of(true);
    };


    @Reduce<ItemsActions>('observerArgs')
    public onObserveArgs: Reducer<ItemsState, ItemsActions, 'observerArgs'> = (state) => {
      return state;
    };

    @Effect<ItemsActions>('asyncEffect', 'switchMap')
    public asyncAction: Updater<ItemsActions, 'asyncEffect'> = (id, email) => {
      return of('test');
    };

    @Reduce<ItemsActions>('asyncEffect')
    public onAsyncAction: Reducer<ItemsState, ItemsActions, 'asyncEffect'> = (state, payload) => {
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

    @Reduce<ItemsActions>('reducerThrows')
    public reducerThrows() {
      throw new Error('from reducer!');
    }

  }

  let store: MyStore;

  beforeEach(() => {
    store = new MyStore();
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

    it('should always provide initial state', () => {

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
      console.log('running test that updated a user');
      debugger;
      store.dispatch('updateOne', {
        name: 'bob',
        newName: 'robert'
      });
      expectObservable(store.users$).toEqual(['alice', 'robert']);
    });

  });

  it('should call a reducer that does not have any effect', () => {
    store.dispatch('findOne', 'alice');

    store.state$.subscribe((users) => {
      console.log(users);

    });

    expectObservable(store.state$).toEqual({users: ['alice', 'bob'], selected: [0, 'alice']});
  });

  it('should call an effect and reduce the state', () => {

    store.dispatch('findAll');

    expectObservable(store.state$).toEqual({users: ['alice', 'bob', 'carl', 'denise']});
    expect(store.effectSpy).toHaveBeenCalledWith('payload');
    expect(store.reduceSpy).toHaveBeenCalledWith(['carl', 'denise']);

  });

  describe('handling concurrency', () => {
    describe('default strategy mergeMap', () => {
      it('should run the effect every time the event is dispatched', () => {
        // store.dispatch()
      });
    });

    xit('should handle async actions', (done) => {

      const payload = [{a: 1}, {b: 2}];

      store.state$.subscribe((state) => {

        console.log('got state', state);
        expect(store.reduceSpy).toHaveBeenCalledTimes(1);
      });

      store.dispatch('asyncAction');
      store.dispatch('asyncAction');
      store.dispatch('asyncAction');

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
      store.dispatch('asyncAction');
      store.dispatch('asyncAction');

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
      }, fail);

      store.dispatch('actionEffectThrows');

    });

    it('should get an error though the error subject (reducer that throws)', (done) => {

      store.error$.subscribe((err) => {
        expect(err).toEqual(Error('from reducer!'));
        done();
      }, fail);


      store.dispatch('reducerThrows');

    });

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

import { Store, StoreOptions } from './store';
import { BaseStore } from './base-store';
import { Reduce } from './reduce';
import { Effect } from './effects/effect';
import { of, ReplaySubject, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { map, multicast } from 'rxjs/operators';
import createSpy = jasmine.createSpy;

describe('base-store', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

  });

  interface ItemsState {
    items: any[];
  }

  enum ItemsActions {
    GET_ALL,
    ANOTHER_ACTION,
    ASYNC_ACTION,
    OBSERVER_ARGS,
    ACTION_EFFECT_THROWS,
    REDUCER_THROWS,
  }

  const initialState = {items: [{a: 0}]};

  const options: StoreOptions = {
    actions: ItemsActions,
    name: 'MyStore',
    initialState
  };

  @Store(options)
  class MyStore extends BaseStore<ItemsState, ItemsActions> {
    public items$ = this.store$.pipe(
      map((state) => {
        return state.items;
      })
    );

    public reduceSpy = createSpy('reduceSpy');
    public effectSpy = createSpy('effectSpy');

    private httpStub$ = (payload) => of(payload).pipe(
      // delay(1000)
    )

    @Effect(ItemsActions.OBSERVER_ARGS, 'switchMap')
    public testObserveArgs(payload: string) {

      return of('test').pipe(
        // delay(100)

      );
    }

    @Reduce(ItemsActions.OBSERVER_ARGS, )
    public testObserveArgsReducer(state) {
      return state;
    }

    @Effect(ItemsActions.ASYNC_ACTION, 'switchMap')
    public onAsyncAction(payload: any[]) {
      console.log('running async effect');
      return this.httpStub$(payload);
    }

    @Reduce(ItemsActions.ASYNC_ACTION)
    public asyncAction(state, payload) {
      console.log('reducing async action', payload);
      this.reduceSpy();
      console.log('reduce spy called');
      return {
        ...state,
        items: payload
      };
    }

    @Effect(ItemsActions.GET_ALL, )
    public onGetAll(payload) {
      console.log('running onGetAll effect');
      this.effectSpy(payload);
      return of(payload);
    }

    @Reduce(ItemsActions.GET_ALL)
    @Reduce(ItemsActions.ANOTHER_ACTION)
    public onGotAll(state, payload) {
      console.log('reducing onGotAll');
      this.reduceSpy(payload);
      return {
        ...state,
        items: payload
      };
    }

    @Effect(ItemsActions.ACTION_EFFECT_THROWS)
    public effectThatThrows() {
      return throwError(new Error('Effect error'));
    }

    @Reduce(ItemsActions.REDUCER_THROWS)
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

    let storeHistory$;

    beforeEach(() => {
      storeHistory$ = store.store$.pipe(
        multicast(() => new ReplaySubject())
      );
      storeHistory$.connect();

      store.dispatch(ItemsActions.ASYNC_ACTION, [1, 2, 3]);
      storeSecondInstance = new MyStore();
    });

    it('should set initial state', () => {
      testScheduler.run(({expectObservable}) => {
        expectObservable(storeHistory$).toBe('(ab)', {
          a: {
            items: [{a: 0}]
          },
          b: {
            items: [1, 2, 3]
          }
        });
      });
    });

    it('should not be shared between different instances', () => {

      testScheduler.run(({expectObservable}) => {
        expectObservable(storeSecondInstance.items$).toBe('a', {
          a: initialState.items

        });
      });

    });

  });

  it('should call a reducer that does not have any effect', () => {
    const payload = [{a: 1}, {b: 2}];
    store.dispatch(ItemsActions.ANOTHER_ACTION, payload);

    testScheduler.run(({expectObservable}) => {
      expectObservable(store.store$).toBe('a', {
        a: {
          items: [{a: 1}, {b: 2}]
        }
      });
    });

    expect(store.reduceSpy).toHaveBeenCalledWith(payload);

  });

  it('should call an effect and reduce the state', () => {

    const payload = [{a: 1}, {b: 2}];
    store.dispatch(ItemsActions.GET_ALL, payload);

    testScheduler.run(({expectObservable}) => {
      expectObservable(store.store$).toBe('a', {
        a: {
          items: [{a: 1}, {b: 2}]
        }
      });
    });

    expect(store.effectSpy).toHaveBeenCalledWith(payload);
    expect(store.reduceSpy).toHaveBeenCalledWith(payload);

  });

  describe('handling concurrency', () => {
    describe('default strategy mergeMap', () => {
      it('should run the effect every time the event is dispatched', () => {
        // store.dispatch()
      });
    });

    xit('should handle async actions', (done) => {

      const payload = [{a: 1}, {b: 2}];

      store.store$.subscribe((state) => {

        console.log('got state', state);
        expect(store.reduceSpy).toHaveBeenCalledTimes(1);
      });

      store.dispatch(ItemsActions.ASYNC_ACTION, payload);
      store.dispatch(ItemsActions.ASYNC_ACTION, payload);
      store.dispatch(ItemsActions.ASYNC_ACTION, payload);

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

      store.store$.subscribe((state) => {
        console.log('got state', state);

      });
      //
      const payload = [{a: 1}, {b: 2}];
      store.dispatch(ItemsActions.ASYNC_ACTION, payload);
      store.dispatch(ItemsActions.ASYNC_ACTION, payload);

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

      store.dispatch(ItemsActions.ACTION_EFFECT_THROWS);

    });

    it('should get an error though the error subject (reducer that throws)', (done) => {

      store.error$.subscribe((err) => {
        expect(err).toEqual(Error('from reducer!'));
        done();
      }, fail);


      store.dispatch(ItemsActions.REDUCER_THROWS);

    });

    it('should not follow the error through the items$ stream', () => {

      store.dispatch(ItemsActions.ACTION_EFFECT_THROWS);
      store.dispatch(ItemsActions.GET_ALL, [{a: 1}]);

      testScheduler.run(({expectObservable}) => {

        const unsub = '^-------- !';
        expectObservable(store.items$, unsub).toBe('a--', {a: [{a: 1}]});
      });

    });
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

/* eslint-disable @typescript-eslint/no-unused-vars */
import { TestScheduler } from '@datakitchen/rxjs-marbles';
import { Observable, Subject, delay, of, throwError } from 'rxjs';
import { Reduce } from '../reduce/reduce';
import { Store, makeStore } from './store';
import { Effect } from '../effect/effect';

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
    // reducerThrows: { name: string };

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

    @Effect()
    public findAll() {
      this.effectSpy('payload');
      return of(['carl', 'denise']);
    }

    @Reduce()
    public onFindAll(state: ItemsState, payload: string[]) {
      this.reduceSpy(payload);
      return {
        users: [...state.users, ...payload]
      };
    }

    @Effect()
    public findOne(name: string): Observable<string> {
      return of(name).pipe(
        delay(500),
      );
    }

    @Reduce()
    public onFindOne(state: ItemsState, name: string): ItemsState {
      const selectedIdx = state.users.findIndex((u) => u === name);
      return {
        ...state,
        selected: [selectedIdx, name]
      };
    }

    @Effect()
    public updateOne(payload: {name: string; newName: string}): Observable<{ name: string; newName: string }> {
      return of(payload);
    }

    @Reduce()
    public onUpdateOne(state: ItemsState, {name, newName}: { name: string; newName: string }): ItemsState {
      const userIdx = state.users.findIndex((u) => u === name);
      state.users[userIdx] = newName;
      return state;

    }

    @Effect('switchMap')
    public observerArgs() {
      return of(true);
    }

    @Reduce()
    public onObserverArgs(state: ItemsState) {
      return state;
    }

    @Effect()
    public asyncEffect(id: string, email: string) {
      return of(`${id}${email}`);
    }

    @Reduce()
    public onAsyncEffect(state: ItemsState, payload: string) {
      this.reduceSpy();
      return {
        ...state,
        items: payload
      };
    }

    @Effect()
    public actionEffectThrows() {
      console.log('throwing error');
      return throwError(new Error('Effect error')).pipe(
        delay(500)

      );
    }

    @Reduce()
    onActionEffectThrows(state: ItemsState, _payload: number): ItemsState {
      return {...state, };
    }

    @Effect()
    removeOne(_name: string): Observable<boolean> {
      return of(true);
    }

    @Reduce()
    onRemoveOne(state: ItemsState, _payload: boolean): ItemsState {
      return state;
    }

    // @Reduce()
    // onReducerThrows(state: ItemsState, payload: {name: string}): ItemsState {
    //   throw new Error('from reducer!');
    // }

  }

  let store: MyStore;
  let scheduler: TestScheduler;

  beforeEach(() => {
    store = new MyStore();
    scheduler = new TestScheduler();

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

      scheduler.expect$(storeSecondInstance.state$).toContain({
        users: ['alice', 'bob']
      });

    });

    it('should not be shared between different instances', () => {
      store.dispatch('updateOne', {name: 'bob', newName: 'bobo'});

      scheduler.expect$(store.users$).toContain(['alice', 'bobo']);
      scheduler.expect$(storeSecondInstance.users$).toContain(['alice', 'bob']);

    });

    it('should update initial state', () => {
      store.dispatch('updateOne', {name: 'alice', newName: 'joy'});
      scheduler.expect$(store.users$).toContain(['joy', 'bob']);

    });

  });

  describe('state mutations', () => {

    it('should find all users', () => {
      store.dispatch('findAll');
      scheduler.expect$(store.users$).toContain(['alice', 'bob', 'carl', 'denise']);
    });

    it('should find a user', () => {

      new TestScheduler().run(({expectObservable}) => {

        store.dispatch('findOne', 'bob');
        expectObservable(store.state$).toBe('a 499ms b', {
          a: {
            users: ['alice', 'bob'],
          },
          b: {
            users: ['alice', 'bob'],
            selected: [1, 'bob']
          }
        });
      });
    });

    it('should update a user', () => {
      store.dispatch('updateOne', {
        name: 'bob',
        newName: 'robert'
      });
      scheduler.expect$(store.users$).toContain(['alice', 'robert']);
    });

    it('should call an effect and reduce the state', () => {

      store.dispatch('findAll');

      scheduler.expect$(store.state$).toContain({users: ['alice', 'bob', 'carl', 'denise']});
      expect(store.effectSpy).toHaveBeenCalledWith('payload');
      expect(store.reduceSpy).toHaveBeenCalledWith(['carl', 'denise']);

    });

    it('should call a reducer for an action that does not have any effect', () => {

      scheduler.run(({expectObservable}) => {

        store.dispatch('findOne', 'alice');

        expectObservable(store.state$).toBe('a 499ms b', {
          a: initialState,
          b: {
            ...initialState,
            selected: [0, 'alice']
          }
        });
      });

    });

  });

  describe('handling concurrency', () => {

    describe('default strategy switchMap', () => {

      it('should only get latest dispatch', () => {


        scheduler.run(({expectObservable}) => {
          store.dispatch('findOne', 'alice');
          store.dispatch('findOne', 'bob');

          expectObservable(store.state$).toBe('a 499ms b', {
            a: initialState,
            b: {...initialState, selected: [1, 'bob']},
          });
        });

      });

    });

  });

  xdescribe('error handling', () => {

    fit('should get an error through the error subject (effect that throws)', () => {

      store.loading$.subscribe((state) => {
        console.log(state);
      });



      scheduler.run(({expectObservable}) => {
        store.dispatch('actionEffectThrows');
        expectObservable(store.loading$).toBe('a');
      });

      // store.dispatch('actionEffectThrows');
      //
      // scheduler.run(({expectObservable, cold}) => {
      //
      //   expectObservable(store.loading$).toBe('a -----|', {});
      // });



    });
  });

  describe('inner observable trigger state change', () => {

    interface Actions {
      connect(): Observable<boolean>;
    }

    interface State {
      connected: boolean;
    }


    class TestInnerObservableStore extends Store<State, Actions> implements makeStore<State, Actions> {

      // suppose this is an internal state of a service
      // for example this could be the connection status
      // of a websocket service which will be set/unset (true/false)
      // on internal event listeners such as
      //
      // socket.on('connect', ....)
      // socket.on('error', ....)
      externalConnection$ = new Subject<boolean>();

      trigger$ = new Subject<boolean>();

      constructor() {
        super({connected: false});

        this.trigger$.pipe(

          delay(1000, scheduler),
        ).subscribe((value) => {
          this.externalConnection$.next(value);
        });
      }

      triggerChange(value: boolean) {
        this.trigger$.next(value);
      }

      @Effect()
      connect(): Observable<boolean> {
        // to connect we want to trigger a connection event in
        // the service and return its internal
        // connection status, i.e.: our external connection status
        this.triggerChange(true);

        return this.externalConnection$.pipe(
        );
      }

      @Reduce()
      onConnect(state: State, payload: boolean): State {


        return {...state, connected: payload};

      }

    }

    let innerObservableStore: TestInnerObservableStore;

    beforeEach(() => {
      innerObservableStore = new TestInnerObservableStore();
      jest.spyOn(innerObservableStore, 'onConnect');
    });

    it('should connect', () => {


      scheduler.run(({expectObservable}) => {

        expectObservable(innerObservableStore.connect()).toBe('1000ms a', {
          a: true,
        });



      });
    });

    it('should trigger state change again', () => {

      scheduler.run(({flush}) => {

        innerObservableStore.dispatch('connect');
        flush();

        expect(innerObservableStore.onConnect).toHaveBeenCalledWith({
          connected: false,
        }, true);

        innerObservableStore.triggerChange(false);
        flush();

        expect(innerObservableStore.onConnect).toHaveBeenCalledWith({
          connected: true,
        }, false);

      });

    });



  });


});

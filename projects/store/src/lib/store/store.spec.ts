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

    @Effect<MyStore>('findAll')
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

    @Effect<MyStore>('findOne', 'concatMap')
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

    @Effect<MyStore>('updateOne')
    public updateOne(payload): Observable<{ name: string, newName: string }> {
      return of(payload);
    }

    @Reduce<ItemsActions>('updateOne')
    public onUpdateOne(state: ItemsState, {name, newName}: { name: string; newName: string }): ItemsState {
      const userIdx = state.users.findIndex((u) => u === name);
      state.users[userIdx] = newName;
      return state;

    };

    @Effect<MyStore>('observerArgs', 'switchMap')
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

    @Effect<MyStore>('actionEffectThrows')
    public actionEffectThrows() {
      return throwError(new Error('Effect error'));
    }

    @Reduce<ItemsActions>('actionEffectThrows')
    onActionEffectThrows<O>(state: ItemsState, payload: number): ItemsState {
      return undefined;
    }

    @Effect<MyStore>('removeOne')
    removeOne(name: string): Observable<boolean> {
      return of(true);
    }

    @Reduce<ItemsActions>('removeOne')
    onRemoveOne<O>(state: ItemsState, payload: boolean): ItemsState {
      return state;
    }

    // @Reduce<ItemsActions>('reducerThrows')
    // onReducerThrows(state: ItemsState, payload: {name: string}): ItemsState {
    //   throw new Error('from reducer!');
    // }

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

      expectObservableWithCallback(({expectObservable}) => {

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
      expectObservable(store.users$).toEqual(['alice', 'robert']);
    });

    it('should call an effect and reduce the state', () => {

      store.dispatch('findAll');

      expectObservable(store.state$).toEqual({users: ['alice', 'bob', 'carl', 'denise']});
      expect(store.effectSpy).toHaveBeenCalledWith('payload');
      expect(store.reduceSpy).toHaveBeenCalledWith(['carl', 'denise']);

    });

    it('should call a reducer for an action that does not have any effect', () => {

      expectObservableWithCallback(({expectObservable}) => {

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

      it('should run the effect every time the event is dispatched', () => {


        expectObservableWithCallback(({expectObservable}) => {
          store.dispatch('findOne', 'alice');
          store.dispatch('findOne', 'bob');

          expectObservable(store.state$).toBe('a 499ms b 499ms c', {
            a: initialState,
            b: {...initialState, selected: [0, 'alice']},
            c: {...initialState, selected: [1, 'bob']},
          });
        });

      });

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
  });

});


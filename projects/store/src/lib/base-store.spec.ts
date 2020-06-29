import { Store } from './store';
import { BaseStore } from './base-store';
import { Reduce } from './reduce';
import { Effect } from './effect';
import { of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { map } from 'rxjs/operators';
import { async } from '@angular/core/testing';
import createSpy = jasmine.createSpy;

describe('base-store', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe('create an empty store', () => {
    interface ItemsState {
      items: any[];
    }


    enum ItemsActions {
      ACTION_ONE,
      ACTION_TWO,
      ACTION_THREE,
    }


    @Store({
      actions: ItemsActions,
      name: 'MyStore',
      useLocalStorage: false,
      initialState: { items: [] },
    })
    class MyStore extends BaseStore<ItemsState> {

      public items$ = this.store$.pipe(
        map((state) => {
          return state.items;
        })
      );

      @Effect(ItemsActions.ACTION_THREE)
      public effectThatThrows() {
        return throwError(new Error('Effect error'));
      }

      @Reduce(ItemsActions.ACTION_TWO)
      protected thisWillThrow() {
        console.log('calling method that will throw');
        throw new Error('my awesome error!');
      }

      @Reduce(ItemsActions.ACTION_ONE)
      protected setState(state: ItemsState, items: any[]): ItemsState {

        return {
          ...state,
          items: items
        };

      }
    }

    let store: MyStore;

    beforeEach(() => {
      store = new MyStore();
    });

    it('should create', () => {
      expect(store).toBeTruthy();
    });


    describe('BUG: initialState reference get stuck between instances', () => {

      let storeSecondInstance: MyStore;

      beforeEach(() => {
        store.dispatch(ItemsActions.ACTION_ONE, [1, 2, 3]);
        storeSecondInstance = new MyStore();
      });

      it('should start with an empty state', () => {

        storeSecondInstance.items$.subscribe((items) => {
          expect(items).toEqual([]);
        }, fail);
      });

    });

    describe('errors', () => {
      it('should throw an error through the error subject', () => {


        store.error$.subscribe(fail, (err) => {
          console.log('error', err);
          expect(err).toEqual({ action: ItemsActions.ACTION_TWO, error: Error('my awesome error!')});
        });

        store.dispatch(ItemsActions.ACTION_TWO);
      });

      it('should not follow the error through the items$ stream', () => {

        store.dispatch(ItemsActions.ACTION_TWO);
        testScheduler.run(({ expectObservable }) => {

          const unsub = '^-------- !';
          expectObservable(store.items$, unsub).toBe('a--', {a: []}, 'my awesome error!');
        });

      });

      it('should handle error from an effect', () => {

        store.dispatch(ItemsActions.ACTION_THREE);

        testScheduler.run(({ expectObservable }) => {

          expectObservable(store.error$).toBe('#', {}, {
            action: ItemsActions.ACTION_THREE,
            error: new Error('Effect error')
          });

          const unsub = '^-------- !';
          expectObservable(store.items$, unsub).toBe('a--', {a: []}, 'my awesome error!');
        });
      });

    });

  });


  describe('create a store with effects and reducers', () => {
    interface ItemsState {
      items: any[];
    }

    enum ItemsActions {
      GET_ALL,
      ANOTHER_ACTION,
    }

    @Store({
      actions: ItemsActions,
      name: 'MyStore',
      useLocalStorage: false,
      initialState: { items: [] },
    })
    class MyStore extends BaseStore<ItemsState> {
      public items$ = this.store$.pipe(
        map((state) => {
          return state.items;
        })
      );

      public reduceSpy = createSpy('reduceSpy');
      public effectSpy = createSpy('effectSpy');

      @Effect(ItemsActions.GET_ALL)
      public onGetAll(payload) {
        this.effectSpy(payload);
        return of(payload);
      }

      @Reduce(ItemsActions.GET_ALL)
      @Reduce(ItemsActions.ANOTHER_ACTION)
      public onGotAll(state, payload) {
        this.reduceSpy(payload);
        return {
          ...state,
          items: payload,
        };
      }

      public dispatchGetAll(items: { [key: string]: string; }[]) {

        super.dispatch(ItemsActions.GET_ALL, items);
      }

    }

    let store: MyStore;

    beforeEach(() => {
      store = new MyStore();

      store.dispatch(ItemsActions.GET_ALL, [{my: 'payload'}]);

    });

    it('should create', () => {
      expect(store).toBeTruthy();
    });

    it('should run the effect', () => {
      expect(store.effectSpy).toHaveBeenCalledWith([{my: 'payload'}]);
    });

    it('should run the reducer', () => {
      expect(store.reduceSpy).toHaveBeenCalledWith([{my: 'payload'}]);

    });

    it('should update the state', async(() => {

      store.items$.subscribe((items) => {
        expect(items).toEqual([{my: 'payload'}]);
      }, fail);

    }));

    it('should work with marble testing', () => {
      testScheduler.run(({ expectObservable }) => {
        const unsub = '^-------- !';
        expectObservable(store.items$, unsub).toBe('a-----', {a: [{my: 'payload'}]});
      });
    });

    it('should use custom dispatch', () => {
      store.dispatchGetAll([{a: '1'}, {b: '2'}, {c: '3'}]);

      testScheduler.run(({ expectObservable }) => {
        const unsub = '^-------- !';
        expectObservable(store.items$, unsub).toBe('a', {a: [{a: '1'}, { b: '2'}, {c: '3'}]});

      });
    });


    it('should be able to bind a reducer to one or more actions', () => {
      store.dispatch(ItemsActions.ANOTHER_ACTION, []);
      expect(store.reduceSpy).toHaveBeenCalledWith([]);
    });
  });

});

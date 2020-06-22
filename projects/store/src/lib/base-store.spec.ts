import { Store } from './store';
import { BaseStore } from './base-store';
import { Reduce } from './reduce';
import { Effect } from './effect';
import { of } from 'rxjs';
import { async } from '@angular/core/testing';
import createSpy = jasmine.createSpy;
import { TestScheduler } from 'rxjs/testing';
import { map, switchMapTo } from 'rxjs/operators';

// localStorage.debug = 'microphi:*:MyStore';

describe('base-store', () => {

  describe('create an empty store', () => {
    interface ItemsState {
      items: [];
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

    }

    let store: MyStore;

    beforeEach(() => {
      store = new MyStore();
    });

    it('should create', () => {
      expect(store).toBeTruthy();
    });

  });

  describe('create a store with effects and reducers', () => {
    interface ItemsState {
      items: [];
    }

    enum ItemsActions {
      GET_ALL,
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

      public reduceSpy = createSpy('reduceSpy').and.callFake(() => {
        console.log('running reduceSpy');
      });
      public effectSpy = createSpy('effectSpy');

      @Effect(ItemsActions.GET_ALL)
      public onGetAll(payload) {
        console.log('running effect');
        this.effectSpy(payload);
        return of([{a: '1'}, {b: '2'}]);
      }

      @Reduce(ItemsActions.GET_ALL)
      public onGotAll(payload) {
        console.log('running reducer', payload);
        this.state.items = payload;
        this.reduceSpy(payload);
        return this.state;
      }

    }

    let store: MyStore;
    let testScheduler: TestScheduler;

    beforeEach(() => {
      store = new MyStore();

      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      });

      store.dispatch(ItemsActions.GET_ALL, {my: 'payload'});

    });

    it('should create', () => {
      expect(store).toBeTruthy();
    });

    it('should run the effect', () => {
      expect(store.effectSpy).toHaveBeenCalledWith({my: 'payload'});
    });

    it('should run the reducer', () => {
      expect(store.reduceSpy).toHaveBeenCalledWith([{a: '1'}, {b: '2'}]);

    });

    it('should update the state', () => {

      testScheduler.run(({ expectObservable }) => {
        expectObservable(store.items$).toBe('a', {a: [{a: '1'},{ b: '2'}]});
      });

    });
  });



});

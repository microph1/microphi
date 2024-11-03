/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable, of } from 'rxjs';
import { Store } from '../store/store';
import { Effect, getEffects } from './effect';
import { makeStore } from '../store/types';

describe('@Effect', () => {

  interface MyActions {
    ONE: () => Observable<any>;
    TWO: () => Observable<any>;
    THREE: () => Observable<any>;
  }

  class TestEffect extends Store<any, MyActions> implements makeStore<any, MyActions> {

    @Effect()
    ONE(): Observable<any> {
      return of();
    }

    @Effect('concatMap')
    THREE(): Observable<any> {
      return of();
    }

    @Effect('mergeMap')
    TWO(): Observable<any> {
      return of();
    }

    onONE<O>(state: any, payload: any): any {
      // no empty
    }

    onTHREE<O>(state: any, payload: any): any {
      // no empty
    }

    onTWO<O>(state: any, payload: any): any {
      // no empty
    }

  }

  let store: TestEffect;

  beforeEach(() => {
    store = new TestEffect({});
  });

  it('should store metadata on the instance of the decorated class', () => {

    expect(getEffects(store)).toEqual([
      { action: 'ONE', strategy: 'switchMap'},
      { action: 'THREE', strategy: 'concatMap'},
      { action: 'TWO', strategy: 'mergeMap'},
    ]);
  });

});

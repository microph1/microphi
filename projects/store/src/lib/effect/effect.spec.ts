import { Effect, getEffectMetadata } from './effect';
import { Store, makeStore } from '../store/store';
import { Observable } from 'rxjs';

describe('@Effect', () => {

  interface MyActions {
    ONE: () => Observable<any>;
    TWO: () => Observable<any>;
    THREE: () => Observable<any>;
  }

  class TestEffect extends Store<any, MyActions> implements makeStore<any, MyActions> {

    @Effect<MyActions>('ONE')
    ONE(): Observable<any> {
      return undefined;
    }

    @Effect<MyActions>('THREE', 'concatMap')
    THREE(): Observable<any> {
      return undefined;
    }

    @Effect<MyActions>('TWO', 'switchMap')
    TWO(): Observable<any> {
      return undefined;
    }

    onONE<O>(state: any, payload: any): any {
    }

    onTHREE<O>(state: any, payload: any): any {
    }

    onTWO<O>(state: any, payload: any): any {
    }

  }

  let store: TestEffect;

  beforeEach(() => {
    store = new TestEffect({});
  });

  it('should store metadata on the instance of the decorated class', () => {

    expect(getEffectMetadata(store)).toEqual({
      ONE: { functionName: 'ONE', strategy: 'mergeMap'},
      TWO: { functionName: 'TWO', strategy: 'switchMap'},
      THREE: { functionName: 'THREE', strategy: 'concatMap'},
    });
  });

});

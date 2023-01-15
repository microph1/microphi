import { Effect, getEffectMetadata, getEffects } from './effect';
import { Store, makeStore } from '../store/store';
import { Observable } from 'rxjs';

describe('@Effect', () => {

  interface MyActions {
    ONE: () => Observable<any>;
    TWO: () => Observable<any>;
    THREE: () => Observable<any>;
  }

  class TestEffect extends Store<any, MyActions> implements makeStore<any, MyActions> {

    @Effect()
    ONE(): Observable<any> {
      return undefined;
    }

    @Effect('concatMap')
    THREE(): Observable<any> {
      return undefined;
    }

    @Effect('mergeMap')
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

    expect(getEffects(store)).toEqual([
      { action: 'ONE', strategy: 'switchMap'},
      { action: 'THREE', strategy: 'concatMap'},
      { action: 'TWO', strategy: 'mergeMap'},
    ]);
  });

});

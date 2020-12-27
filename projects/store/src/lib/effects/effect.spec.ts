import { Effect, getEffectMetadata } from './effect';
import { Actions, BaseStore } from '../base-store';
import { Observable } from 'rxjs';

describe('@Effect', () => {

  interface MyEffects extends Actions {
    ONE: () => Observable<any>;
    TWO: () => Observable<any>;
    THREE: () => Observable<any>;
  }


  class TestEffect extends BaseStore<any, MyEffects> {

    @Effect<MyEffects>('ONE')
    public onEffectOne() {}

    @Effect<MyEffects>('TWO', 'switchMap')
    public withSwitchMap() {}

    @Effect<MyEffects>('THREE', 'concatMap')
    public withConcatMap() {}

  }

  let store: TestEffect;

  beforeEach(() => {
    store = new TestEffect();
  });

  it('should store metadata on the instance of the decorated class', () => {

    expect(getEffectMetadata(store)).toEqual({
      ONE: { functionName: 'onEffectOne', strategy: 'mergeMap'},
      TWO: { functionName: 'withSwitchMap', strategy: 'switchMap'},
      THREE: { functionName: 'withConcatMap', strategy: 'concatMap'},
    });
  });

  it('should throw an error if effect is used on more than one method', () => {
    try {
      class Offending extends BaseStore<any, MyEffects> {

        @Effect<MyEffects>('ONE')
        public onEffectOne() {}

        @Effect<MyEffects>('ONE')
        public onEffectOne2() {}

      }
    } catch (e) {
      expect(e.message).toEqual('Effect ONE already used on onEffectOne');
    }
  });

});

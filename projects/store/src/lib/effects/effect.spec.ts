import { Effect, getEffectMetadata } from './effect';
import { BaseStore } from '../base-store';

describe('@Effect', () => {

  enum MyEffects {
    ONE,
    TWO,
    THREE,
  }


  class TestEffect extends BaseStore<any, MyEffects> {

    @Effect(MyEffects.ONE)
    public onEffectOne() {}

    @Effect(MyEffects.TWO, 'switchMap')
    public withSwitchMan() {}

    @Effect(MyEffects.THREE, 'concatMap')
    public withConcatMap() {}

  }

  let store: TestEffect;

  beforeEach(() => {
    store = new TestEffect();
  });

  it('should store metadata on the instance of the decorated class', () => {

    expect(getEffectMetadata(store)).toEqual({
      0: {functionName: 'onEffectOne', strategy: 'mergeMap'},
      1: {functionName: 'withSwitchMan', strategy: 'switchMap'},
      2: {functionName: 'withConcatMap', strategy: 'concatMap'},
    });
  });

  it('should throw an error if effect is used on more than one method', () => {
    try {
      class Offending extends BaseStore<any> {

        @Effect(MyEffects.ONE)
        public onEffectOne() {}

        @Effect(MyEffects.ONE)
        public onEffectOne2() {}

      }
    } catch (e) {
      expect(e.message).toEqual('Effect 0 already used on onEffectOne');
    }
  });

});

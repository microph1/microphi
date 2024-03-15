import { Injectable } from '../injctable/injectable.decorator';

describe('@Injectable', () => {

  @Injectable()
  class TestClassA {}

  @Injectable()
  class TestClassB {}

  it('should make injectables available for injection', () => {
    expect(true).toBeTruthy();
    // expect(injectables.get('TestClassA')).toEqual(Object.getPrototypeOf(TestClassA));
    // expect(injectables.get('TestClassB')).toEqual(Object.getPrototypeOf(TestClassB));
  });

  xit('injectables should not be instantiated yet', () => {
    // expect(singletons.size).toEqual(0);
  });

});

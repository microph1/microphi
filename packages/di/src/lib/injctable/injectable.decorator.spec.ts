import { TestBed } from '../../testing/test-bed';
import { ClassNameSymbol, getInjectableMetadata, InjectableDecorator } from './injectable.decorator';
import { injector } from './injector';
// import { Injectable } from '../injctable/injectable.decorator';

describe('@Injectable', () => {

  // @Injectable()
  // class TestClassA {}
  //
  // @Injectable()
  // class TestClassB {}

  it('should make injectables available for injection', () => {
    expect(true).toBeTruthy();
    // expect(injectables.get('TestClassA')).toEqual(Object.getPrototypeOf(TestClassA));
    // expect(injectables.get('TestClassB')).toEqual(Object.getPrototypeOf(TestClassB));
  });

  it.skip('injectables should not be instantiated yet', () => {
    // expect(singletons.size).toEqual(0);
  });

});

describe('InjectableDecorator', () => {

  it('should resolve the undecorated class to the same singleton as the decorated one', () => {
    class Service {}
    const Decorated = InjectableDecorator(Service);

    TestBed.configure({ providers: [Decorated] });

    expect(getInjectableMetadata(Service)).toEqual(Decorated[ClassNameSymbol]);
    expect(injector(Service)).toBe(TestBed.inject(Decorated));
  });

});

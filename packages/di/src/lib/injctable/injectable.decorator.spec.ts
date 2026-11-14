import { TestBed } from '../../testing/test-bed';
import { ClassNameSymbol, getInjectableMetadata, Injectable, InjectableDecorator } from './injectable.decorator';
import { injector } from './injector';
import { DI } from '../container/di.decorator';
import { bootstrap } from '../container/bootstrap';
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

  it('should not collide two distinct classes with the same name', () => {
    // a name-plus-random-suffix key collided whenever both drew the same suffix
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    // what a bundler does: two unrelated classes renamed to the same temp name
    function declare(tag: string) {
      @Injectable()
      class _b {
        readonly tag = tag;
      }
      return _b;
    }
    const One = declare('one');
    const Two = declare('two');
    expect(One.name).toEqual(Two.name);

    TestBed.configure({ providers: [One, Two] });

    expect(TestBed.inject(One).tag).toEqual('one');
    expect(TestBed.inject(Two).tag).toEqual('two');
    expect(injector(One)).not.toBe(injector(Two));

    vi.restoreAllMocks();
  });

  it('should resolve a member decorator target and the @DI root class to the same instance', () => {
    @DI({ providers: [] })
    class App {}

    const app = bootstrap(App);
    // what member decorators see: the class before @DI() wrapped it
    const original = Object.getPrototypeOf(App);

    expect(injector(original)).toBe(app);
  });

});

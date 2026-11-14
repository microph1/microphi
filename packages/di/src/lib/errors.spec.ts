import { className, DiError } from './errors';
import { Injectable } from './injctable/injectable.decorator';
import { injector } from './injctable/injector';
import { Inject } from './injctable/inject.decorator';
import { TestBed } from '../testing/test-bed';

describe('DiError', () => {

  class NotDecorated {}

  @Injectable()
  class NotProvided {}

  beforeEach(() => {
    TestBed.configure({ providers: [] });
  });

  it('should start with the code and link to its docs', () => {
    const error = new DiError('DI002', 'message');

    expect(error.code).toEqual('DI002');
    expect(error.message).toEqual('DI002: message\nSee https://github.com/microph1/microphi/blob/master/packages/di/ERRORS.md#di002');
  });

  it('DI001: injecting a class not decorated with @Injectable()', () => {
    expect(() => injector(NotDecorated)).toThrow(/^DI001: NotDecorated is not decorated with @Injectable\(\)/);
  });

  it('DI001: providing a class not decorated with @Injectable()', () => {
    expect(() => TestBed.configure({ providers: [NotDecorated] })).toThrow(/^DI001: NotDecorated /);
    expect(() => TestBed.configure({ providers: [{ provide: NotDecorated, useClass: NotDecorated }] })).toThrow(/^DI001: NotDecorated /);
  });

  it('DI002: injecting an @Injectable() nobody provides', () => {
    expect(() => injector(NotProvided)).toThrow(/^DI002: NotProvided is not provided/);
  });

  it('DI003: a dependency cycle throws on injection, naming the path', () => {
    @Injectable()
    class A {}

    @Injectable()
    class B {
      constructor(@Inject(A) readonly a: A) {}
    }

    // A -> B -> A: the cycle closes through the provider of A
    @Injectable()
    class AImpl {
      constructor(@Inject(B) readonly b: B) {}
    }

    TestBed.configure({ providers: [{ provide: A, useClass: AImpl }, B] });

    expect(() => TestBed.inject(A)).toThrow(/^DI003: Cyclic dependency: A -> B -> A\. Break the cycle/);
    expect(() => injector(B)).toThrow(/^DI003: Cyclic dependency: B -> A -> B\./);

    // the failed attempts leave nothing half-resolved behind
    TestBed.configure({ providers: [A, B] });
    expect(TestBed.inject(B).a).toBe(TestBed.inject(A));
  });

  it('should name the declared class, not the name a bundler gave the decorated one', () => {
    @Injectable()
    class Repository {}
    // esbuild lowers `return class extends klass { static ... }` to `_b = class ...`
    Object.defineProperty(Repository, 'name', { value: '_b' });

    expect(className(Repository)).toEqual('Repository');
    expect(() => injector(Repository)).toThrow(/^DI002: Repository is not provided/);
    expect(() => TestBed.inject(Repository)).toThrow(/^DI004: Unable to instantiate Repository:/);
  });
});

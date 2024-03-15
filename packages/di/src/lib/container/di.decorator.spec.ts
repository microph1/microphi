import { DI } from './di.decorator';
import { injector } from '../injctable/injector';
import { Inject } from '../injctable/inject.decorator';
import { Injectable } from '../injctable/injectable.decorator';
import { bootstrap } from './bootstrap';

describe('@DI', () => {

  @Injectable()
  class A {
    static instance = 0;

    constructor() {
      ++A.instance;
    }

    sayHello = jest.fn();
  }

  @Injectable()
  class B {
    name = 'this is the B class';

    constructor(
      @Inject(A) public a: A
    ) {
    }
  }

  @Injectable()
  class C {

    name = `this is the c class with ${this.b.name}`;

    constructor(
      @Inject(B) public b: B
    ) {
    }
  }

  @Injectable()
  class D {

    name = 'Class D';

    constructor(
      @Inject(A) public a: A
    ) {
      a.sayHello(this.name);
    }

  }

  @DI({
    providers: [
      {
        provide: A,
        useClass: class _ extends A {
          constructor() {
            super();
            console.log('this is a mock for the class A');
          }
        }
      },
      B,
      C,
      D,
    ]
  })
  class App {
  }

  let b: B;

  beforeEach(() => {
    bootstrap(App);
    b = injector(B);

  });


  it('should create', () => {
    expect(b).toBeTruthy();
  });

});

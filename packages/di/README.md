# @microphi/di [![npm version](https://badge.fury.io/js/%40microphi%2Fdi.svg)](https://badge.fury.io/js/%40microphi%2Fdi)

> Yet another di container for javascript/typescript

## install

`npm i -S @microphi/di` or `yarn add @microphi/di`

## How to use

Decorate a class with `@Injectable()`.

```typescript
// my-class.ts


import { Injectable } from '@microphi/di';

@Injectable()
class MyClass {

  public sayHello(name: string) {
    return `Hello ${name}`;
  }
}
```

Inject it using `@Inject(<Class>)`

```typescript
// consumer.ts

import { Inject } from '@microphi/di';

class Consumer {

  constructor(
    @Inject(MyClass) public myClassSingleton: MyClass
  ) {
    this.myClassSingleton.sayHello('consumer');
  }

}
```

Getting a singleton programmatically

```typescript
// my-script.ts

const singleton = injector(MyClass);

```

Create the app

```typescript

@DI({
  providers: [
    MyClass,
  ]
})
class App {
}

const app = bootstrap(App);
```

## Providing custom implementation
`providers` array also accept an object such as:

```typescript
@DI({
  providers: [
    {
      provide: MyClass,
      useClass: MyCustomImplementation,
    },
  ]
})
class App {
}

const app = bootstrap(App);
```

## Testing
In order to test a singleton and mock dependencies use `TestBed`

```typescript
import { Inject } from '@microphi/di';


describe('MyClass', () => {

  @Injectable()
  class HttpService {
  }

  @Injectable()
  class TestClass {
    constructor(
      @Inject(HttpService) http: HttpService,
    ) {
    }
  }

  let instance;

  beforeEach(() => {
    TestBed.configure({
      providers: [
        TestClass,
        {
          provide: HttpService,
          useClass: class {
            // test implementation
          }
        }
      ]
    });

    instance = TestBed.inject(TestClass);
  });

  it('should exist', () => {
    expect(instance).toBeTruthy();
  });
});

```

## Mocked
Only if jest is used the `Mocked` utility can be used to automatically mock any given class.

```typescript
import { Inject } from '@microphi/di';


describe('MyClass', () => {

  @Injectable()
  class HttpService {
  }

  @Injectable()
  class TestClass {
    constructor(
      @Inject(HttpService) http: HttpService,
    ) {
    }
  }

  let instance;

  beforeEach(() => {
    TestBed.configure({
      providers: [
        TestClass,
        {
          provide: HttpService,
          useClass: Mocked(HttpService)
        }
      ]
    });

    instance = TestBed.inject(TestClass);
  });

  it('should exist', () => {
    expect(instance).toBeTruthy();
  });
});
```
for more info look at its [tests](src/lib/testing/mocked.spec.ts)


## DEBUG
Prepend `DEBUG=microgamma:digator*` to your script to see debugging information.

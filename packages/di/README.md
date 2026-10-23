# @microphi/di [![npm](https://img.shields.io/npm/v/@microphi/di)](https://www.npmjs.com/package/@microphi/di)

> Handcrafted DI container: `@Injectable`, `@Inject`, `@DI`, aspects (`@Before`, `@After`, `@Cache`) and a `TestBed`

## Install

```sh
npm i @microphi/di reflect-metadata
```

`reflect-metadata` is a peer dependency (di imports it itself). Enable legacy decorators in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## How to use

Decorate a class with `@Injectable()`:

```typescript
import { Injectable } from '@microphi/di';

@Injectable()
export class Greeter {
  sayHello(name: string) {
    return `Hello ${name}`;
  }
}
```

Inject it with `@Inject(<Class>)`. The consumer must be `@Injectable()` too: that is what resolves its constructor parameters.

```typescript
import { Inject, Injectable } from '@microphi/di';

@Injectable()
export class Consumer {
  constructor(@Inject(Greeter) private greeter: Greeter) {
    this.greeter.sayHello('consumer');
  }
}
```

Register the providers on a root class and bootstrap it:

```typescript
import { bootstrap, DI } from '@microphi/di';

@DI({
  providers: [Greeter, Consumer],
})
class App {}

const app = bootstrap(App);
```

Every provider is a singleton. Get one programmatically with `injector`:

```typescript
import { injector } from '@microphi/di';

const greeter = injector(Greeter);
```

A dependency cycle (`A` injects `B` injects `A`) throws when the classes are declared, not when they are instantiated.

### Providing a custom implementation

```typescript
@DI({
  providers: [
    { provide: Greeter, useClass: LoudGreeter },
  ],
})
class App {}
```

## Aspects

Method decorators that work on any class, injectable or not.

### `@Before(fn)`

Runs `fn` with the method's arguments before the method. If `fn` returns a value, it replaces the arguments (return an array for several); returning `undefined` keeps the originals.

```typescript
class Greeter {
  @Before<string>((name) => name.toUpperCase())
  sayHello(name: string) {
    return `Hello ${name}`;
  }
}

new Greeter().sayHello('bob'); // Hello BOB
```

### `@After(fn)`

Runs `fn` with the method's return value; whatever `fn` returns is what the caller gets.

```typescript
class Greeter {
  @After<string>((greeting) => `${greeting}!`)
  sayHello(name: string) {
    return `Hello ${name}`;
  }
}
```

### `@Cache(options?)`

Caches the value returned by the method, per instance, keyed by its arguments.

```typescript
class SongDb {
  @Cache({ ttl: 60_000, trackBy: (id: string) => id })
  async fetchCoverArt(id: string) {
    return fetch(`/cover/${id}`);
  }
}
```

- `ttl`: time to live in ms, default 5 minutes
- `trackBy`: builds the cache key from the arguments, default `JSON.stringify(args)`

The returned value itself is cached, so for a `Promise` concurrent callers share the same pending call, and a rejection is cached for the `ttl` too. An `Observable` is cached as is: a cold one re-runs its work on every subscription unless it is shared (e.g. `shareReplay(1)`).

## Testing

`TestBed.configure()` resets the container and registers the given providers, so each test starts with fresh singletons and its own overrides. The container itself is module-level state: test files are isolated from each other by the test runner, but tests in the same file must not run concurrently (`it.concurrent`).

```typescript
import { Inject, Injectable, TestBed } from '@microphi/di';

@Injectable()
class HttpService {}

@Injectable()
class UserService {
  constructor(@Inject(HttpService) public http: HttpService) {}
}

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configure({
      providers: [
        UserService,
        { provide: HttpService, useClass: class { /* test implementation */ } },
      ],
    });

    service = TestBed.inject(UserService);
  });

  it('should exist', () => {
    expect(service).toBeTruthy();
  });
});
```

### `Mocked`

`Mocked(Class, options?)` builds a class whose methods are all mocks: `vi.fn()` under vitest, `jest.fn()` under jest, no-op functions otherwise.

```typescript
import { Mocked, TestBed } from '@microphi/di';

TestBed.configure({
  providers: [
    UserService,
    {
      provide: HttpService,
      useClass: Mocked(HttpService, {
        get: () => of({ id: 1 }), // custom implementation
        post: 'NO_MOCK',          // keep the real method
      }),
    },
  ],
});
```

For more examples see its [tests](src/testing/mocked.spec.ts).

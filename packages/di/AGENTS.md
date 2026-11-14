# @microphi/di — notes for coding agents

Decorator-based DI container. Full docs: [README.md](README.md); every error code: [ERRORS.md](ERRORS.md).

## Rules

- Requires `"experimentalDecorators": true` and `import 'reflect-metadata'` once (di does it itself). TC39 (stage 3) decorators are not supported.
- Every class that is injected **or that injects** must be `@Injectable()`.
- Constructor dependencies are explicit: `constructor(@Inject(Greeter) private greeter: Greeter)`. Type-based injection without `@Inject` does not work.
- A class is only instantiable once it is listed in `providers` of `@DI()` (or `TestBed.configure`). `@Injectable()` alone is not enough (error `DI002`).
- Every provider is a singleton; `injector(Class)` returns it outside constructors.
- Swap an implementation with `{ provide: Base, useClass: Impl }`: only `Base` needs `@Injectable()`.
- The container is module-level state: one app per process (or per test file).

## Aspects

`@Before(fn)`, `@After(fn)` and `@Cache({ ttl, trackBy })` are method decorators that work on any class, injectable or not. `@Cache` caches the returned value itself: a Promise is shared by concurrent callers, and a rejection is cached for the `ttl`.

## Testing

Use the shipped doubles instead of hand-rolled mocks:

```typescript
import { Mocked, TestBed } from '@microphi/di';

beforeEach(() => {
  // resets the container: list everything the test injects
  TestBed.configure({
    providers: [
      UserService,
      { provide: HttpService, useClass: Mocked(HttpService, { get: () => of([]) }) },
    ],
  });
});

it('...', () => {
  const service = TestBed.inject(UserService);
});
```

- `Mocked(Class, overrides?)`: every method becomes `vi.fn()` / `jest.fn()`; pass an implementation per method, or `'NO_MOCK'` to keep the real one.
- Tests in the same file must not run concurrently (`it.concurrent`): they share the container.

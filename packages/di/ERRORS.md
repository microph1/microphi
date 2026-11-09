# @microphi/di errors

Every error the container throws is a `DiError`: `error.code` is one of the codes below, and the message starts with the code and ends with a link here.

## DI001

**A class not decorated with `@Injectable()` was provided or injected.**

The container only knows classes that `@Injectable()` registered.

```typescript
@Injectable()          // ← missing
export class UserService {}
```

Fix: decorate the class with `@Injectable()`. With `{ provide, useClass }` the `provide` class must be decorated; `useClass` does not need to be.

## DI002

**An `@Injectable()` class was injected but nothing provides it.**

`@Injectable()` registers the class; the container only instantiates it once it is listed in the `providers` of `@DI()` (or of `TestBed.configure` in tests).

```typescript
@DI({ providers: [UserService] })
class App {}
```

Fix: add the class to `providers`. `TestBed.configure` replaces every provider, so a test must list everything it injects, including the dependencies of the class under test (or provide mocks for them).

## DI003

**Cyclic dependency.**

Two classes `@Inject` each other, directly or through other classes, so neither can be built first.

Fix: break the cycle, typically by moving the logic both need into a third service both inject.

## DI004

**A provider resolved to no class.**

A `{ provide, useClass }` provider was registered with an undefined `useClass`, usually because of a circular import evaluated before the class was defined.

Fix: check the import of the `useClass` class; move it out of the import cycle.

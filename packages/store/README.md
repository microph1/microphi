# @microphi/store [![npm](https://img.shields.io/npm/v/@microphi/store)](https://www.npmjs.com/package/@microphi/store)

> Pure RxJS state manager driven by `@Effect` / `@Reduce` decorators

## Install

```sh
npm i @microphi/store @microphi/di rxjs reflect-metadata
```

Enable legacy decorators in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## How to use

### Define the state

```typescript
interface UsersState {
  users: string[];
  selected?: string;
}
```

### Define the actions

Every action returns an `Observable`; its arguments are what `dispatch` takes.

```typescript
interface UsersActions {
  findAll: () => Observable<string[]>;
  findOne: (id: string) => Observable<string>;
}
```

### Implement effects and reducers

For each action the store needs an `@Effect()` method named like the action and an `@Reduce()` method named `on` + `PascalCase(action)`. A missing one throws when the store is constructed.

```typescript
import { Observable, of } from 'rxjs';
import { Effect, makeStore, Reduce, Store } from '@microphi/store';

class UsersStore extends Store<UsersState, UsersActions>
  // optional: type-checks that every effect and reducer is implemented
  implements makeStore<UsersState, UsersActions> {

  constructor() {
    // initial state, must be serializable: each instance gets its own deep copy
    super({ users: ['alice', 'bob'] });
  }

  @Effect()
  findAll(): Observable<string[]> {
    return of(['carl', 'denise']);
  }

  // receives the current state and the value emitted by the effect
  @Reduce()
  onFindAll(state: UsersState, users: string[]): UsersState {
    return { ...state, users: [...state.users, ...users] };
  }

  @Effect()
  findOne(id: string): Observable<string> {
    return fromFetch(`https://my.endpoint/users/${id}`).pipe(switchMap((r) => r.json()));
  }

  @Reduce()
  onFindOne(state: UsersState, selected: string): UsersState {
    return { ...state, selected };
  }
}
```

### Dispatch and select

```typescript
const store = new UsersStore();

// every state change
store.state$.subscribe((state) => console.log(state));

// or a projection, emitted only when it changes
store.select(({ users }) => users).subscribe((users) => console.log(users));

store.dispatch('findAll');
store.dispatch('findOne', 'alice'); // arguments are type-checked against UsersActions
```

### Loading and errors

Every action is treated as async, so each has a loading state:

```typescript
store.getLoadingFor('findOne').subscribe((loading) => console.log({ loading }));
```

`loading$` carries the full event: `{ code, payload, status, response?, error? }`.

If an effect errors, the error is logged and emitted on `loading$` (with `status: false` and `error`), the state is left untouched and the action can be dispatched again.

### Effects that emit more than once

The reducer runs for every value the effect emits, so a long-lived effect (a connection, a socket) keeps updating the state after the dispatch that started it.

## Strategies

When an action is dispatched again while its previous effect is still running, the strategy passed to `@Effect` decides what happens:

| Strategy | Behaviour |
|---|---|
| `switchMap` (default) | the pending effect is cancelled, only the latest one reduces |
| `mergeMap` | effects run in parallel, each reduces as it completes |
| `concatMap` | effects run one after the other, in dispatch order |

```typescript
@Effect('mergeMap')
findOne(id: string): Observable<string> {
  return fromFetch(`https://my.endpoint/users/${id}`).pipe(switchMap((r) => r.json()));
}
```

## Operators

### `@Cache`

Caches the Observable an effect returns, per store instance and per arguments, so a cached dispatch does not call the effect method again. The Observable itself is resubscribed: a cold one (like `fromFetch`) re-runs its request unless it is shared, e.g. with `shareReplay(1)`.

```typescript
@Effect('mergeMap')
@Cache({ ttl: 1_000, trackBy: (id: string) => id.toLowerCase() })
findOne(id: string): Observable<string> {
  return fromFetch(`https://my.endpoint/users/${id}`).pipe(
    switchMap((r) => r.json()),
    shareReplay(1),
  );
}
```

- `ttl`: time to live in ms, default 5 minutes
- `trackBy`: builds the cache key from the effect's arguments, default `JSON.stringify(args)`

`@Cache` lives in `@microphi/di` and works on any class; it is re-exported here.

### `@DebounceTime`

Debounces dispatches of the action, as `debounceTime` in an RxJS pipe:

```typescript
@Effect('switchMap')
@DebounceTime(300)
search(query: string): Observable<string[]> {
  return fromFetch(`https://my.endpoint/search?q=${query}`).pipe(switchMap((r) => r.json()));
}
```

### `@DelayTime`

Delays each effect's result, as `delay` in an RxJS pipe:

```typescript
/**
 * with concatMap this rate-limits the effect to one call per 100 ms
 */
@Effect('concatMap')
@DelayTime(100)
track(id: string) {
  return fromFetch(`https://my.endpoint/track/${id}`);
}
```

⚠️ With strategies other than `concatMap` the result may not be what you expect: see [delay.spec.ts](./src/lib/operators/delay.spec.ts) for every combination.

`@DebounceTime` and `@DelayTime` are read by the store's dispatch pipeline, so they only have an effect on a `Store` subclass.

## .skills

Automation agents can invoke the following skills when working inside `packages/store`.

### build-store-lib
- Goal: emit both ESM and CJS bundles from `src`.
- From the repo root: `npm install` (first run or when deps change), then `npm run build -w packages/di -w packages/store` (store needs di's `lib/` output).
- Checks: `packages/store/lib/esm/index.js` and `packages/store/lib/cjs/index.js` are regenerated.

### test-store-lib
- Goal: run the package's vitest suite with coverage, mirroring CI.
- `cd packages/store && npm run test:ci` (wraps `vitest run --coverage`).
- Single spec: `npx vitest run src/lib/store/store.spec.ts` within this folder.

### lint-store-lib
- Goal: enforce the repo's TypeScript + ESLint rules before commits.
- `cd packages/store && npm run lint` (runs `eslint ./src`); autofix with `npx eslint ./src --fix`, then rerun lint and tests.

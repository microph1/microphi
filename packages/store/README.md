# @microphi/store

@microphi/store is a pure RxJS state manager.

## Install
With your favourite package manager install
```
@microphi/store
```

### Define the state
```typescript
interface ItemsState {
  users: string[];
  selected?: [number, string];
}
```

### Define the actions
```typescript
interface ItemsActions {
  // An action MUST always return an Observable
  findAll: () => Observable<string[]>;
  // select: (name: string) => Observable<[number, string]>;
}
```
### Implement effects and reducers in the store

```typescript
import { Store, Effect, Reduce } from '@microphi/store';

// -> Create a class that extends `Store` such as
class MyStore extends Store<ItemsState, ItemsActions>
    implements makeStore<ItemsState, ItemsActions> {
  // -> optionally implement `makeStore` to add extra type checking

  constructor() {
    // -> Set the initial state
    super({
      users: ['alice', 'bob'],
    });
  }

  @Effect()
  // -> Implement `findAll` method
  findAll(): Observable<string[]> {
    // - Simulate an async call
    return of(['alice', 'bob', 'carl', 'denise']);
  }

  @Reduce() // - Decorate with `@Reduce` so the `Store` knows this is a reducer
  // -> Method name MUST be `on` + capitalized `actionName`
  //  its first argument is always the current state
  //  its second argument is the output of its action without the Observable.
  public onFindAll(state: ItemsState, payload: string[]) {
    // -> add state transition logic here

    // -> Return the new state
    return {
      users: [...state.users, ...payload]
    };
  }
}
```

### Dispatch and select state
```typescript
// given an instance of the store
const store = new MyStore();

// subscribe to any state change
store.state$.subscribe((state) => console.log({ state }) );

// or better select a projection of the state
store.select(({users}) => users).subscribe((users) => console.log({ users }));

// finally dispatch an action
store.dispatch('findAll');

```

#### Watch loading state
We assume every action to be an asyncronious task so every action as a loading state associated to it. Loading state can we subscribed such as:
```typescript
store.getLoadingFor('findAll').subscribe((loading) => {

  console.log({loading});

});

```

### Choose the right strategy
We assume that an action always execute an async effect. Internally such effect is wrapped in a RxJS pipe, as such there are several way this can be done.
So for example when we dispatch an action such as `findOne` let's say its effect is a call to and endpoint to retrieve an entity by its id.
Dependending on the scenario we may want to `switchMap`, `mergeMap` or `concatMap`.

This can be achieved passing the `strategy` argument to the `@Effect` decorator such as:

```typescript

class MyStore extends Store<ItemsState, ItemsActions>
    implements makeStore<ItemsState, ItemsActions> {

  constructor() {
    super({
      users: ['alice', 'bob'],
      selected: undefined,

    });
  }

  @Effect('mergeMap')
  findOne(id: string): Observable<string> {
    return fromFetch(`http://my.super.endpoint/${id}`)
  }

  @Reduce()
  public onFindOne(state: ItemsState, select: string) {
    return {
      ...state,
      selected,
    };
  }
}
```

### Operators
When dispatching actions some RxJS operators can be applied using decorators:

#### Cache
It caches the value returned from the effect (i.e.: its observable) for 300_000 (default) milliseconds (i.e.: 5 mins) or the amount of milliseconds provided in the `ttl` field.
The effect will be cached according to its arguments. I.e.: like a memoized function `@Cache` will get check arguments and cache their result separately.

Optionally a `trackBy` function can be provided in order to customized how arguments are considered for caching.
If not provided `JSON.stringify` is used to serialize the arguments.
If provided `trackBy` will have the exact same arguments of the effect being annotated.
```typescript

class MyStore extends Store<ItemsState, ItemsActions>
    implements makeStore<ItemsState, ItemsActions> {

  constructor() {
    super({
      users: ['alice', 'bob'],
      selected: undefined,

    });
  }

  @Effect('mergeMap')
  @Cache({ttl: 1_000, trackBy: (id: string) => id.toLowerCase()})
  findOne(id: string): Observable<string> {
    return fromFetch(`http://my.super.endpoint/${id}`)
  }

  @Reduce()
  public onFindOne(state: ItemsState, select: string) {
    return {
      ...state,
      selected,
    };
  }
}
```


#### DebounceTime
It will debouce calling the effect as in a RxJS pipe

```typescript

class MyStore extends Store<ItemsState, ItemsActions>
    implements makeStore<ItemsState, ItemsActions> {

  constructor() {
    super({
      users: ['alice', 'bob'],
      selected: undefined,

    });
  }

  @Effect('mergeMap')
  @DebounceTime(300)
  findOne(id: string): Observable<string> {
    return fromFetch(`http://my.super.endpoint/${id}`)
  }

  @Reduce()
  public onFindOne(state: ItemsState, select: string) {
    return {
      ...state,
      selected,
    };
  }
}
```

#### DelayTime
It will deley an effect as in a RxJS pipe.
```typescript
  class TestClass extends Store<State, Actions> {

    /**
     * this effect will be rate limited at one call per 100 ms
     */
    @Effect('concatMap')
    @DelayTime(100)
    effectWithDelay(id: string) {
      return fromFetch(`http://my.super.endpoint/${id}`)
    }

    @Reduce()
    onEffectWithDelay(state: State, payload: string): State {
      return {...state, items: [...state.items, payload]};
    }
  }
```
⚠️ Note the use of `concatMap` strategy. If another strategy is used the effect of `@DelayTime` may be not what really expected.
Please see [delay.spec.ts](./src/lib/operators/delay.spec.ts) for all possible combination of `strategy` and `@DelayTime`

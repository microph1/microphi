# @microphi/store

A different way of doing state management with RxJS.

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

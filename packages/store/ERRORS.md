# @microphi/store errors

Every error the store throws is a `StoreError`: `error.code` is one of the codes below, and the message starts with the code and ends with a link here.

## STORE001

**`dispatch` was called with an action the store does not know.**

A store knows the actions that have an `@Effect()` or an `@Reduce()` method; any other name throws.

Fix: check the spelling, or add the `@Effect()` method and its `on<Action>` reducer.

## STORE002

**An action has a reducer but no effect.**

Thrown by the constructor: every action needs an `@Effect()` method named like the action.

```typescript
@Effect()
load() {
  return this.http.get('/users');
}

@Reduce()
onLoad(state: State, users: User[]) {
  return { ...state, users };
}
```

Fix: add the `@Effect()` method (return `of(payload)` when there is nothing to do).

## STORE003

**An action with an empty name.**

Fix: the action name is the method name; check decorators applied to computed or empty keys.

## STORE004

**An action has an effect but no reducer.**

Thrown by the constructor: the reducer of action `load` must be a method called `onLoad` (`on` + the action name with its first letter capitalized), decorated with `@Reduce()`.

Fix: add or rename the reducer.

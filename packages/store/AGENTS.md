# @microphi/store — notes for coding agents

Pure RxJS state manager. Full docs: [README.md](README.md); every error code: [ERRORS.md](ERRORS.md).

## Rules

- Requires `"experimentalDecorators": true`.
- A store extends `Store<State, Actions>`; `Actions` maps each action name to `(...args) => Observable<T>`.
- **Every action needs both** an `@Effect()` method named like the action and an `@Reduce()` method named `on` + the action with its first letter capitalized (`findOne` → `onFindOne`). A missing one throws in the constructor (`STORE002`, `STORE004`). Add `implements makeStore<State, Actions>` to get that checked at compile time.
- An effect returns an `Observable`; return `of(payload)` when there is no side effect.
- A reducer is pure and synchronous: `(state, effectValue) => newState`, never mutate `state`.
- The initial state must be JSON-serializable: each instance deep-copies it with `JSON.parse(JSON.stringify())` (no `Map`, `Date`, class instances).
- Pick the strategy explicitly for concurrent dispatches: `@Effect('switchMap')` (default, cancels), `'mergeMap'` (parallel), `'concatMap'` (queued).
- Effect errors do not throw: they are logged and emitted on `loading$` with `status: false`; read them with `getLoadingFor(action)` or `loading$`.
- Read state with `store.select((state) => state.x)` (distinct values) or `state$`; don't keep a copy of the state elsewhere.
- `@Cache`, `@DebounceTime(ms)`, `@DelayTime(ms)` go between `@Effect()` and the method. `@Cache` caches the Observable, not its values: add `shareReplay(1)` to cold Observables.

## Testing

Construct the store directly (it is not a DI provider unless you make it one), dispatch, and assert on `state$`/`select` emissions. Effects that call services can be tested with `TestBed` and `Mocked` from `@microphi/di`.

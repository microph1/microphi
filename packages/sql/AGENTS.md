# @microphi/sql — notes for coding agents

Decorator-driven SQLite storage over `node:sqlite` or Cloudflare D1. Full docs: [README.md](README.md).

## Rules

- Every storage method is async: await them, including `has` and `getCount`.
- `NodeSqliteDriver` comes from `@microphi/sql/node`, never from the root entry: the root must stay free of `node:` imports so it bundles for Workers.
- Every entity needs exactly one `@PrimaryKey()`; `resolveSchema` throws otherwise.
- With @microphi/di, the storage is `@Injectable()` with no constructor, and the app provides `{ provide: SqlDriver, useClass: Db }`, where `Db` extends `D1Driver` / `NodeSqliteDriver` with a no-argument constructor. A decorated storage always takes its driver from the container, even when called as `new Store(driver)`.
- Tests: `TestBed.configure({ providers: [{ provide: SqlDriver, useClass: MemoryDb }, Store] })` with `class MemoryDb extends NodeSqliteDriver { constructor() { super(':memory:'); } }`.
- Bundled by esbuild (wrangler, tsx, vite)? Give every `@Column` an explicit `type`: no `emitDecoratorMetadata`, so inference falls back to TEXT.
- D1 has no `BEGIN`/`COMMIT`. Atomic multi-statement writes go through `driver.batch()`.
- D1 caps bound parameters at 100 per statement: anything building `IN (...)` must chunk by `driver.maxParams`.
- `where` / `orderBy` options are raw SQL. Bind values through `whereParams`.
- Tests run every storage case against both drivers (D1 through miniflare); keep new storage tests inside the `describe.each`.

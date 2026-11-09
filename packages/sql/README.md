# @microphi/sql

Decorator-driven SQLite storage. Declare tables with `@Entity`, `@PrimaryKey`,
`@Column` and `@JsonColumn`, group them with `@SqlStorage`, and run the same
async storage over Node's built-in `node:sqlite` or Cloudflare D1.

```sh
npm install @microphi/sql reflect-metadata
```

## Entities

```ts
import { Column, Entity, JsonColumn, PrimaryKey, SqlStorage, SqliteStorage, SqlDriver } from '@microphi/sql';

@Entity('books')
export class Book {
  @PrimaryKey()
  isbn!: string;

  @Column({ type: 'TEXT', nullable: false })
  title!: string;

  @Column({ type: 'REAL' })
  rating?: number;

  @Column({ type: 'BOOLEAN' })
  inPrint?: boolean;

  @JsonColumn()
  genres?: string[];
}

@SqlStorage([Book])
export class Library extends SqliteStorage {
  constructor(driver: SqlDriver) {
    super(driver);
  }
}
```

- Every entity needs exactly one `@PrimaryKey()` (TEXT).
- Column types: `TEXT`, `INTEGER`, `REAL`, `BLOB`, `BOOLEAN` (stored as 0/1) and
  `JSON` (stored as TEXT, parsed on read).
- Without `type`, `@Column()` infers it from `design:type`, which needs
  `emitDecoratorMetadata`. esbuild-based toolchains (wrangler, tsx, vite) don't
  emit it, and every inferred column falls back to TEXT. Pass `type` explicitly
  when the entity is bundled by one of them.
- Every table gets `created` and `modified` ISO timestamps. `created` is kept
  across upserts.

## Drivers

**Node** (Node ≥ 22.13), from the `/node` entry so Worker bundles never see `node:` imports:

```ts
import { NodeSqliteDriver } from '@microphi/sql/node';

const library = new Library(NodeSqliteDriver.open('./data/library.db'));
await library.migrate(); // CREATE TABLE IF NOT EXISTS for every entity
```

**Cloudflare D1**: pass the binding. Create tables with a migration instead of `migrate()`:

```ts
import { D1Driver } from '@microphi/sql';

export default {
  async fetch(request: Request, env: { DB: D1Database }) {
    const library = new Library(new D1Driver(env.DB));
    return Response.json(await library.table<Book>('books').getAll());
  },
};
```

```ts
// scripts/schema.ts: write the DDL into a wrangler migration
import { schemaSql } from '@microphi/sql';
process.stdout.write(schemaSql([Book]));
```

Any other SQLite connection works by implementing `SqlDriver`: `all`, `first`, `run`,
an atomic `batch` and `maxParams`.

## Storage API

All methods are async. `tableName` defaults to the first entity in `@SqlStorage([...])`.
`table<T>(name)` returns the same methods bound to one table.

| Method | |
|---|---|
| `get(id)`, `getAll()`, `getByIds(ids)`, `has(id)` | reads by primary key; `getByIds` chunks to the driver's parameter limit |
| `getPaged({ where, whereParams, orderBy, orderDir, limit, offset })` | filtered, ordered page |
| `getCount(where?, params?)` | row count |
| `getDistinctColumnPaged(column, opts)`, `countDistinctColumn(column, where?, params?)` | distinct values of a column |
| `getAutoTrail(id)`, `getAllWithAutoTrail()` | `created` / `modified` |
| `upsert(...docs)` | insert or replace, atomically (one transaction / D1 batch) |
| `remove(...ids)`, `execDelete(where, params)`, `deleteAll()` | deletes |
| `migrate()` | creates every table if missing |

`where` and `orderBy` are trusted SQL fragments: bind values through
`whereParams` / `params`, never interpolate user input. Table and column names
are always quoted.

## License

MIT

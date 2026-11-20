import { SqlDriver, SqlStatement, SqlValue } from '../driver.js';

/** What a libSQL statement result needs to have: `@libsql/client`'s `ResultSet`. */
export interface LibsqlResultLike {
  columns: string[];
  rows: ArrayLike<unknown>[];
  rowsAffected: number;
}

/**
 * The part of `@libsql/client`'s `Client` the driver uses. Structural, so this
 * package depends on neither build: pass `createClient` from
 * `@libsql/client` (native, `file:` databases) or `@libsql/client/web`
 * (fetch only: Lambda, Workers, Deno).
 */
export interface LibsqlClientLike {
  execute(statement: { sql: string; args: SqlValue[] }): Promise<LibsqlResultLike>;
  batch(statements: { sql: string; args: SqlValue[] }[], mode: 'write'): Promise<unknown>;
  close(): void;
}

/**
 * SqlDriver over libSQL: a local `file:` database, or Turso over HTTP.
 * Rows come back as plain objects keyed by column.
 */
export class LibsqlDriver extends SqlDriver {
  // SQLite's own limit is 32766; stay well under it so one IN (...) stays a cheap statement.
  readonly maxParams = 999;

  constructor(readonly client: LibsqlClientLike) {
    super();
  }

  async all<T>(sql: string, params: SqlValue[] = []): Promise<T[]> {
    const { columns, rows } = await this.client.execute({ sql, args: params });
    return Array.from(rows, (row) => {
      const values = row as ArrayLike<unknown>;
      return Object.fromEntries(columns.map((name, i) => [name, values[i]])) as T;
    });
  }

  async first<T>(sql: string, params: SqlValue[] = []): Promise<T | undefined> {
    return (await this.all<T>(sql, params))[0];
  }

  async run(sql: string, params: SqlValue[] = []): Promise<{ changes: number }> {
    const { rowsAffected } = await this.client.execute({ sql, args: params });
    return { changes: rowsAffected };
  }

  /** `write` mode makes the batch one transaction: all of it applies, or none. */
  async batch(statements: SqlStatement[]): Promise<void> {
    if (!statements.length) return;
    await this.client.batch(statements.map(({ sql, params = [] }) => ({ sql, args: params })), 'write');
  }

  override close(): void {
    this.client.close();
  }
}

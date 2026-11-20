import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { SqlDriver, SqlStatement, SqlValue } from '../driver';

/**
 * SqlDriver over Node's built-in `node:sqlite`. Exported from
 * `@microphi/sql/node` only, so Worker bundles never pull in `node:` modules.
 */
export class NodeSqliteDriver implements SqlDriver {
  // SQLITE_MAX_VARIABLE_NUMBER default since 3.32.
  readonly maxParams = 32766;

  constructor(readonly db: DatabaseSync) {}

  /** Opens (and creates, with its directory) a database file, or `:memory:`. */
  static open(path: string): NodeSqliteDriver {
    if (path !== ':memory:') {
      mkdirSync(dirname(path), { recursive: true });
    }
    return new NodeSqliteDriver(new DatabaseSync(path));
  }

  async all<T>(sql: string, params: SqlValue[] = []): Promise<T[]> {
    return this.db.prepare(sql).all(...params) as T[];
  }

  async first<T>(sql: string, params: SqlValue[] = []): Promise<T | undefined> {
    return this.db.prepare(sql).get(...params) as T | undefined;
  }

  async run(sql: string, params: SqlValue[] = []): Promise<{ changes: number }> {
    const { changes } = this.db.prepare(sql).run(...params);
    return { changes: Number(changes) };
  }

  async batch(statements: SqlStatement[]): Promise<void> {
    if (!statements.length) return;
    this.db.exec('BEGIN');
    try {
      for (const { sql, params = [] } of statements) {
        this.db.prepare(sql).run(...params);
      }
      this.db.exec('COMMIT');
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  close(): void {
    this.db.close();
  }
}

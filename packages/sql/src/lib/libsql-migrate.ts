import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { LibsqlClientLike } from './drivers/libsql.driver.js';

/** A write transaction, as `@libsql/client`'s `Client.transaction('write')` returns it. */
export interface LibsqlTransactionLike {
  executeMultiple(sql: string): Promise<void>;
  execute(statement: { sql: string; args: string[] }): Promise<unknown>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  close(): void;
}

export interface LibsqlMigrationClientLike extends Pick<LibsqlClientLike, 'execute'> {
  transaction(mode: 'write'): Promise<LibsqlTransactionLike>;
}

/** The bookkeeping table: one row per applied file. */
export const MIGRATIONS_TABLE = '_migrations';

/**
 * Applies every `*.sql` file in `dir` not yet recorded in `_migrations`, in
 * name order (name them `NNNN_what.sql`), each in its own transaction with its
 * bookkeeping row: a file is applied completely or not at all. An applied file
 * must never change: add a new one instead. Returns the names it applied.
 *
 * Generate the first one from the entities with `schemaSql`.
 */
export async function migrate(client: LibsqlMigrationClientLike, dir: string): Promise<string[]> {
  await client.execute({ sql: `CREATE TABLE IF NOT EXISTS "${MIGRATIONS_TABLE}" ("name" TEXT PRIMARY KEY NOT NULL, "applied" TEXT NOT NULL)`, args: [] });
  const { rows } = await client.execute({ sql: `SELECT "name" FROM "${MIGRATIONS_TABLE}"`, args: [] });
  const done = new Set(Array.from(rows, (row) => String((row as ArrayLike<unknown>)[0])));
  const pending = (await readdir(dir)).filter((name) => name.endsWith('.sql') && !done.has(name)).sort();

  for (const name of pending) {
    const tx = await client.transaction('write');
    try {
      await tx.executeMultiple(await readFile(join(dir, name), 'utf8'));
      await tx.execute({ sql: `INSERT INTO "${MIGRATIONS_TABLE}" ("name", "applied") VALUES (?, ?)`, args: [name, new Date().toISOString()] });
      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw new Error(`migration ${name} failed: ${(e as Error).message}`, { cause: e });
    } finally {
      tx.close();
    }
  }
  return pending;
}

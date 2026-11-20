import { Injectable } from '@microphi/di';

export type SqlValue = string | number | bigint | null | Uint8Array;

export interface SqlStatement {
  sql: string;
  params?: SqlValue[];
}

/**
 * The few operations SqliteStorage needs from a SQLite connection. Async so
 * the same storage runs on a local file (node:sqlite) and over the network
 * (Cloudflare D1).
 *
 * A class rather than an interface so it is the DI token storages inject:
 * provide an implementation with `{ provide: SqlDriver, useClass: Db }`, where
 * `Db` extends `D1Driver` or `NodeSqliteDriver` and opens the connection in a
 * no-argument constructor.
 */
@Injectable()
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- only adds the optional close() below
export abstract class SqlDriver {
  abstract all<T = Record<string, unknown>>(sql: string, params?: SqlValue[]): Promise<T[]>;
  abstract first<T = Record<string, unknown>>(sql: string, params?: SqlValue[]): Promise<T | undefined>;
  abstract run(sql: string, params?: SqlValue[]): Promise<{ changes: number }>;
  /** Runs every statement in one transaction: all of them apply, or none. */
  abstract batch(statements: SqlStatement[]): Promise<void>;
  /**
   * Most bound parameters one statement may carry. Storage chunks `IN (...)`
   * lists to stay under it. D1 allows 100.
   */
  abstract readonly maxParams: number;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- optional, so subclasses need not implement it
export interface SqlDriver {
  close?(): void | Promise<void>;
}

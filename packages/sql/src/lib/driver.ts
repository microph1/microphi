export type SqlValue = string | number | bigint | null | Uint8Array;

export interface SqlStatement {
  sql: string;
  params?: SqlValue[];
}

/**
 * The few operations SqliteStorage needs from a SQLite connection. Async so
 * the same storage runs on a local file (node:sqlite) and over the network
 * (Cloudflare D1).
 */
export interface SqlDriver {
  all<T = Record<string, unknown>>(sql: string, params?: SqlValue[]): Promise<T[]>;
  first<T = Record<string, unknown>>(sql: string, params?: SqlValue[]): Promise<T | undefined>;
  run(sql: string, params?: SqlValue[]): Promise<{ changes: number }>;
  /** Runs every statement in one transaction: all of them apply, or none. */
  batch(statements: SqlStatement[]): Promise<void>;
  /**
   * Most bound parameters one statement may carry. Storage chunks `IN (...)`
   * lists to stay under it. D1 allows 100.
   */
  readonly maxParams: number;
  close?(): void | Promise<void>;
}

import { SqlDriver, SqlStatement, SqlValue } from '../driver';

/**
 * The slice of Cloudflare's `D1Database` this driver uses. Declared here so the
 * package does not depend on `@cloudflare/workers-types`; the real binding
 * (`env.DB`) satisfies it structurally.
 */
export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  all<T = unknown>(): Promise<{ results: T[] }>;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<{ meta: { changes?: number } }>;
}

export interface D1DatabaseLike {
  prepare(sql: string): D1PreparedStatementLike;
  batch(statements: D1PreparedStatementLike[]): Promise<unknown[]>;
}

export class D1Driver implements SqlDriver {
  readonly maxParams = 100;

  constructor(private readonly db: D1DatabaseLike) {}

  private statement(sql: string, params: SqlValue[] = []): D1PreparedStatementLike {
    const stmt = this.db.prepare(sql);
    return params.length ? stmt.bind(...params) : stmt;
  }

  async all<T>(sql: string, params?: SqlValue[]): Promise<T[]> {
    const { results } = await this.statement(sql, params).all<T>();
    return results;
  }

  async first<T>(sql: string, params?: SqlValue[]): Promise<T | undefined> {
    return (await this.statement(sql, params).first<T>()) ?? undefined;
  }

  async run(sql: string, params?: SqlValue[]): Promise<{ changes: number }> {
    const { meta } = await this.statement(sql, params).run();
    return { changes: meta.changes ?? 0 };
  }

  // D1 rejects BEGIN/COMMIT; batch() is its transaction.
  async batch(statements: SqlStatement[]): Promise<void> {
    if (!statements.length) return;
    await this.db.batch(statements.map(({ sql, params }) => this.statement(sql, params)));
  }
}

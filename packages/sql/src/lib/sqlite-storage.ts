/* eslint-disable @typescript-eslint/no-explicit-any */
import { SqlDriver, SqlStatement, SqlValue } from './driver';
import { EntitySchema, SqlEntity, createTableSql, getEntityClasses, quoteIdentifier, resolveSchema } from './entity';

type ResolvedSchema = EntitySchema & { primaryKey: string };

export interface AutoTrail {
  created?: string;
  modified?: string;
}

export interface PagedOptions {
  /** Trusted SQL: interpolated as-is. Never pass user input. */
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  /** Trusted SQL fragment; bind values through `whereParams`. */
  where?: string;
  whereParams?: SqlValue[];
  limit?: number;
  offset?: number;
}

export interface DistinctPagedOptions {
  /** Trusted SQL: the column whose MIN/MAX orders the groups. Defaults to `created`. */
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  /** Trusted SQL fragment; bind values through `whereParams`. */
  where?: string;
  whereParams?: SqlValue[];
  limit?: number;
  offset?: number;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Async storage for the entities declared with `@SqlStorage([...])`, over any
 * SqlDriver. Every row carries a `created`/`modified` auto-trail; `created`
 * survives upserts.
 *
 * Tables are not created implicitly: call `migrate()` (local / tests), or apply
 * the DDL from `schemaSql()` as a migration (D1).
 */
export abstract class SqliteStorage {
  protected readonly schemas = new Map<string, ResolvedSchema>();
  protected readonly entityClasses = new Map<string, SqlEntity>();

  protected constructor(protected readonly driver: SqlDriver) {
    const entities = getEntityClasses(this.constructor);
    if (!entities.length) {
      throw new Error(`${this.constructor.name} manages no entities. Did you decorate it with @SqlStorage([...])?`);
    }
    for (const EntityClass of entities) {
      const schema = resolveSchema(EntityClass);
      this.schemas.set(schema.tableName, schema);
      this.entityClasses.set(schema.tableName, EntityClass);
    }
  }

  /** `CREATE TABLE IF NOT EXISTS` for every managed entity, atomically. */
  async migrate(): Promise<void> {
    await this.driver.batch(
      [...this.schemas.values()].map(schema => ({ sql: createTableSql(schema.tableName, schema) })),
    );
  }

  table<T>(tableName: string): TableAccessor<T> {
    this.schema(tableName);
    return new TableAccessor<T>(this, tableName);
  }

  async get<T>(id: string, tableName?: string): Promise<T | undefined> {
    const schema = this.schema(tableName);
    const row = await this.driver.first(
      `SELECT * FROM ${quoteIdentifier(schema.tableName)} WHERE ${quoteIdentifier(schema.primaryKey)} = ?`,
      [id],
    );
    return row ? this.rowToEntity(row, schema) : undefined;
  }

  async getAll<T>(tableName?: string): Promise<T[]> {
    const schema = this.schema(tableName);
    const rows = await this.driver.all(`SELECT * FROM ${quoteIdentifier(schema.tableName)}`);
    return rows.map(row => this.rowToEntity(row, schema));
  }

  /** Rows for the given ids, in no particular order; unknown ids are skipped. */
  async getByIds<T>(ids: string[], tableName?: string): Promise<T[]> {
    const schema = this.schema(tableName);
    const results: T[] = [];
    for (const part of chunk(ids, this.driver.maxParams)) {
      const rows = await this.driver.all(
        `SELECT * FROM ${quoteIdentifier(schema.tableName)} WHERE ${quoteIdentifier(schema.primaryKey)} IN (${part.map(() => '?').join(',')})`,
        part,
      );
      results.push(...rows.map(row => this.rowToEntity<T>(row, schema)));
    }
    return results;
  }

  async getPaged<T>(tableName?: string, options: PagedOptions = {}): Promise<T[]> {
    const schema = this.schema(tableName);
    const { orderBy, orderDir = 'ASC', where, whereParams = [], limit, offset = 0 } = options;
    const params: SqlValue[] = [...whereParams];
    let sql = `SELECT * FROM ${quoteIdentifier(schema.tableName)}`;
    if (where) sql += ` WHERE ${where}`;
    if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir === 'DESC' ? 'DESC' : 'ASC'}`;
    if (limit != null) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }
    const rows = await this.driver.all(sql, params);
    return rows.map(row => this.rowToEntity<T>(row, schema));
  }

  async has(id: string, tableName?: string): Promise<boolean> {
    const schema = this.schema(tableName);
    const row = await this.driver.first(
      `SELECT 1 AS found FROM ${quoteIdentifier(schema.tableName)} WHERE ${quoteIdentifier(schema.primaryKey)} = ?`,
      [id],
    );
    return !!row;
  }

  async getCount(tableName?: string, where?: string, whereParams: SqlValue[] = []): Promise<number> {
    const schema = this.schema(tableName);
    const row = await this.driver.first<{ count: number }>(
      `SELECT COUNT(*) AS count FROM ${quoteIdentifier(schema.tableName)}${where ? ` WHERE ${where}` : ''}`,
      whereParams,
    );
    return Number(row?.count ?? 0);
  }

  async getAutoTrail(id: string, tableName?: string): Promise<AutoTrail | undefined> {
    const schema = this.schema(tableName);
    const row = await this.driver.first<AutoTrail>(
      `SELECT created, modified FROM ${quoteIdentifier(schema.tableName)} WHERE ${quoteIdentifier(schema.primaryKey)} = ?`,
      [id],
    );
    return row ? { created: row.created ?? undefined, modified: row.modified ?? undefined } : undefined;
  }

  async getAllWithAutoTrail(tableName?: string): Promise<({ id: string } & AutoTrail)[]> {
    const schema = this.schema(tableName);
    const rows = await this.driver.all<{ id: string } & AutoTrail>(
      `SELECT ${quoteIdentifier(schema.primaryKey)} AS id, created, modified FROM ${quoteIdentifier(schema.tableName)}`,
    );
    return rows.map(({ id, created, modified }) => ({ id, created: created ?? undefined, modified: modified ?? undefined }));
  }

  /**
   * Distinct values of `column`, one per group, ordered by the MAX (DESC) or
   * MIN (ASC) of `orderBy` within each group.
   */
  async getDistinctColumnPaged(column: string, tableName?: string, options: DistinctPagedOptions = {}): Promise<string[]> {
    const schema = this.schema(tableName);
    const col = this.column(schema, column);
    const { orderBy = 'created', orderDir = 'DESC', where, whereParams = [], limit, offset = 0 } = options;
    const params: SqlValue[] = [...whereParams];
    let sql = `SELECT ${col} FROM ${quoteIdentifier(schema.tableName)}`;
    if (where) sql += ` WHERE ${where}`;
    sql += ` GROUP BY ${col} ORDER BY ${orderDir === 'DESC' ? 'MAX' : 'MIN'}(${orderBy}) ${orderDir === 'DESC' ? 'DESC' : 'ASC'}`;
    if (limit != null) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }
    const rows = await this.driver.all<Record<string, string>>(sql, params);
    return rows.map(row => row[column]).filter(Boolean);
  }

  async countDistinctColumn(column: string, tableName?: string, where?: string, whereParams: SqlValue[] = []): Promise<number> {
    const schema = this.schema(tableName);
    const row = await this.driver.first<{ count: number }>(
      `SELECT COUNT(DISTINCT ${this.column(schema, column)}) AS count FROM ${quoteIdentifier(schema.tableName)}${where ? ` WHERE ${where}` : ''}`,
      whereParams,
    );
    return Number(row?.count ?? 0);
  }

  /**
   * Inserts or fully replaces each document, atomically. Columns a document
   * omits are written as NULL. `created` is set on insert and kept on update;
   * `modified` is set on both.
   */
  async upsert<T extends object>(docs: T[], tableName?: string): Promise<void> {
    const schema = this.schema(tableName);
    if (!docs.length) return;

    const timestamp = new Date().toISOString();
    const columns = Object.keys(schema.columns);
    const updates = columns
      .filter(col => col !== schema.primaryKey && col !== 'created')
      .map(col => `${quoteIdentifier(col)} = excluded.${quoteIdentifier(col)}`)
      .join(', ');
    const sql =
      `INSERT INTO ${quoteIdentifier(schema.tableName)} (${columns.map(quoteIdentifier).join(', ')}) ` +
      `VALUES (${columns.map(() => '?').join(', ')}) ` +
      `ON CONFLICT(${quoteIdentifier(schema.primaryKey)}) DO UPDATE SET ${updates}`;

    const statements: SqlStatement[] = docs.map(doc => {
      const row = this.entityToRow(doc, schema);
      if (row[schema.primaryKey] == null) {
        throw new Error(`Cannot upsert into "${schema.tableName}": document has no "${schema.primaryKey}"`);
      }
      row['created'] ??= timestamp;
      row['modified'] = timestamp;
      // Bindings reject undefined (node:sqlite and D1 alike).
      return { sql, params: columns.map(col => row[col] ?? null) };
    });

    await this.driver.batch(statements);
  }

  async remove(ids: string[], tableName?: string): Promise<void> {
    const schema = this.schema(tableName);
    if (!ids.length) return;
    await this.driver.batch(chunk(ids, this.driver.maxParams).map(part => ({
      sql: `DELETE FROM ${quoteIdentifier(schema.tableName)} WHERE ${quoteIdentifier(schema.primaryKey)} IN (${part.map(() => '?').join(',')})`,
      params: part,
    })));
  }

  /** `DELETE ... WHERE <where>`. `where` is trusted SQL; bind values through `params`. */
  async execDelete(tableName: string, where: string, params: SqlValue[] = []): Promise<number> {
    const schema = this.schema(tableName);
    const { changes } = await this.driver.run(`DELETE FROM ${quoteIdentifier(schema.tableName)} WHERE ${where}`, params);
    return changes;
  }

  async deleteAll(tableName?: string): Promise<void> {
    const schema = this.schema(tableName);
    await this.driver.run(`DELETE FROM ${quoteIdentifier(schema.tableName)}`);
  }

  async close(): Promise<void> {
    await this.driver.close?.();
  }

  protected rowToEntity<T>(row: Record<string, any>, schema: ResolvedSchema): T {
    const EntityClass = this.entityClasses.get(schema.tableName)!;
    const entity = new EntityClass();
    for (const [colName, colMeta] of Object.entries(schema.columns)) {
      const value = row[colName];
      if (colMeta.type === 'JSON') {
        entity[colName] = typeof value === 'string' ? JSON.parse(value) : value ?? null;
      } else if (colMeta.type === 'BOOLEAN') {
        entity[colName] = value == null ? value : value === 1 || value === 1n || value === true;
      } else {
        entity[colName] = value;
      }
    }
    return entity;
  }

  protected entityToRow(doc: Record<string, any>, schema: ResolvedSchema): Record<string, any> {
    const row: Record<string, any> = {};
    for (const [colName, colMeta] of Object.entries(schema.columns)) {
      const value = doc[colName];
      if (value === undefined) continue;
      if (colMeta.type === 'JSON') {
        row[colName] = value === null ? null : JSON.stringify(value);
      } else if (colMeta.type === 'BOOLEAN') {
        row[colName] = value === null ? null : value ? 1 : 0;
      } else {
        row[colName] = value;
      }
    }
    return row;
  }

  /** The schema for `tableName`, or for the first managed entity when omitted. */
  protected schema(tableName?: string): ResolvedSchema {
    const name = tableName ?? this.schemas.keys().next().value!;
    const schema = this.schemas.get(name);
    if (!schema) {
      throw new Error(`Table "${name}" is not managed by ${this.constructor.name}. Known tables: ${[...this.schemas.keys()].join(', ')}`);
    }
    return schema;
  }

  private column(schema: ResolvedSchema, column: string): string {
    if (!schema.columns[column]) {
      throw new Error(`Table "${schema.tableName}" has no column "${column}"`);
    }
    return quoteIdentifier(column);
  }
}

/** SqliteStorage bound to one table. */
export class TableAccessor<T> {
  constructor(
    private readonly storage: SqliteStorage,
    readonly tableName: string,
  ) {}

  get(id: string): Promise<T | undefined> {
    return this.storage.get<T>(id, this.tableName);
  }

  getAll(): Promise<T[]> {
    return this.storage.getAll<T>(this.tableName);
  }

  getByIds(ids: string[]): Promise<T[]> {
    return this.storage.getByIds<T>(ids, this.tableName);
  }

  getPaged(options?: PagedOptions): Promise<T[]> {
    return this.storage.getPaged<T>(this.tableName, options);
  }

  has(id: string): Promise<boolean> {
    return this.storage.has(id, this.tableName);
  }

  getCount(where?: string, whereParams?: SqlValue[]): Promise<number> {
    return this.storage.getCount(this.tableName, where, whereParams);
  }

  getAutoTrail(id: string): Promise<AutoTrail | undefined> {
    return this.storage.getAutoTrail(id, this.tableName);
  }

  getAllWithAutoTrail(): Promise<({ id: string } & AutoTrail)[]> {
    return this.storage.getAllWithAutoTrail(this.tableName);
  }

  getDistinctColumnPaged(column: string, options?: DistinctPagedOptions): Promise<string[]> {
    return this.storage.getDistinctColumnPaged(column, this.tableName, options);
  }

  countDistinctColumn(column: string, where?: string, whereParams?: SqlValue[]): Promise<number> {
    return this.storage.countDistinctColumn(column, this.tableName, where, whereParams);
  }

  upsert(...docs: T[]): Promise<void> {
    return this.storage.upsert(docs as object[], this.tableName);
  }

  remove(...ids: string[]): Promise<void> {
    return this.storage.remove(ids, this.tableName);
  }

  execDelete(where: string, params?: SqlValue[]): Promise<number> {
    return this.storage.execDelete(this.tableName, where, params);
  }

  deleteAll(): Promise<void> {
    return this.storage.deleteAll(this.tableName);
  }
}

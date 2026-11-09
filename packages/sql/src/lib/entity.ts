/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

export type SqliteColumnType = 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB' | 'JSON' | 'BOOLEAN';

export type withAutoTrail<T> = T & {
  created?: string;
  modified?: string;
};

export interface ColumnOptions {
  type?: SqliteColumnType;
  primaryKey?: boolean;
  nullable?: boolean;
  default?: string | number | boolean | null;
}

export interface ColumnMetadata {
  name: string;
  type: SqliteColumnType;
  primaryKey?: boolean;
  nullable: boolean;
  default?: string | number | boolean | null;
}

export interface EntitySchema {
  tableName: string;
  columns: Record<string, ColumnMetadata>;
}

export type SqlEntity = new () => any;

const ENTITY_METADATA_KEY = Symbol('microphi:sql:entity');
const STORAGE_ENTITIES_KEY = Symbol('microphi:sql:entities');

function getOrCreateMetadata(target: Function): EntitySchema {
  // Own property only: a subclass must not write its columns into the parent's schema.
  if (!Object.prototype.hasOwnProperty.call(target, ENTITY_METADATA_KEY)) {
    (target as any)[ENTITY_METADATA_KEY] = { tableName: '', columns: {} };
  }
  return (target as any)[ENTITY_METADATA_KEY];
}

function defineColumn(target: object, propertyKey: string | symbol, column: Omit<ColumnMetadata, 'name'>): void {
  const meta = getOrCreateMetadata(target.constructor);
  meta.columns[propertyKey as string] = { name: propertyKey as string, ...column };
}

/**
 * Maps a property to a column. Without an explicit `type` it is inferred from
 * `design:type`, which needs `emitDecoratorMetadata`. Bundlers that strip it
 * (esbuild, tsx, wrangler) leave every inferred column as TEXT: pass `type`
 * whenever the entity may be compiled by one of those.
 */
export function Column(options: ColumnOptions = {}): PropertyDecorator {
  return (target, propertyKey) => defineColumn(target, propertyKey, {
    type: options.type || inferType(target, propertyKey),
    primaryKey: options.primaryKey || false,
    nullable: options.nullable ?? true,
    default: options.default,
  });
}

export function PrimaryKey(): PropertyDecorator {
  return (target, propertyKey) => defineColumn(target, propertyKey, {
    type: 'TEXT',
    primaryKey: true,
    nullable: false,
  });
}

/** Stored as TEXT, serialised with JSON.stringify and parsed back on read. */
export function JsonColumn(): PropertyDecorator {
  return (target, propertyKey) => defineColumn(target, propertyKey, {
    type: 'JSON',
    nullable: true,
  });
}

/**
 * Marks a class as a table definition.
 * Usage: `@Entity('songs') class Song { ... }`
 */
export function Entity(tableName: string): ClassDecorator {
  return (target: Function) => {
    getOrCreateMetadata(target).tableName = tableName;
  };
}

export function getEntitySchema(target: Function): EntitySchema | undefined {
  return Object.prototype.hasOwnProperty.call(target, ENTITY_METADATA_KEY)
    ? (target as any)[ENTITY_METADATA_KEY]
    : undefined;
}

/**
 * Declares the entities a storage class manages.
 * Usage: `@SqlStorage([Author, Book]) class BookStore extends SqliteStorage { ... }`
 */
export function SqlStorage(entities: SqlEntity[]): ClassDecorator {
  return (target: Function) => {
    (target as any)[STORAGE_ENTITIES_KEY] = entities;
  };
}

export function getEntityClasses(target: Function): SqlEntity[] {
  return (target as any)[STORAGE_ENTITIES_KEY] || [];
}

export function inferType(target: object, propertyKey: string | symbol): SqliteColumnType {
  const type = Reflect.getMetadata('design:type', target, propertyKey as string);

  if (type === String) return 'TEXT';
  if (type === Number) return 'INTEGER';
  if (type === Boolean) return 'BOOLEAN';
  if (type === Array || type === Object) return 'JSON';

  return 'TEXT';
}

export function quoteIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function sqlLiteral(value: string | number | boolean | null): string {
  if (value === null) return 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') return String(value);
  return `'${value.replace(/'/g, '\'\'')}'`;
}

/** Storage type of a logical column type: BOOLEAN is INTEGER, JSON is TEXT. */
export function storageType(type: SqliteColumnType): string {
  if (type === 'BOOLEAN') return 'INTEGER';
  if (type === 'JSON') return 'TEXT';
  return type;
}

export function createTableSql(tableName: string, schema: EntitySchema): string {
  const cols = Object.values(schema.columns)
    .map(col => {
      let sql = `${quoteIdentifier(col.name)} ${storageType(col.type)}`;
      if (col.primaryKey) sql += ' PRIMARY KEY';
      if (!col.nullable) sql += ' NOT NULL';
      if (col.default !== undefined) sql += ` DEFAULT ${sqlLiteral(col.default)}`;
      return sql;
    })
    .join(', ');

  return `CREATE TABLE IF NOT EXISTS ${quoteIdentifier(tableName)} (${cols})`;
}

export const AUTO_TRAIL_COLUMNS: Record<'created' | 'modified', ColumnMetadata> = {
  created: { name: 'created', type: 'TEXT', nullable: true },
  modified: { name: 'modified', type: 'TEXT', nullable: true },
};

/**
 * The schema a storage actually creates for an entity: its own columns plus
 * the `created`/`modified` auto-trail. Throws unless there is exactly one
 * primary key, since every read and write is keyed on it.
 */
export function resolveSchema(EntityClass: SqlEntity): EntitySchema & { primaryKey: string } {
  const schema = getEntitySchema(EntityClass);
  if (!schema?.tableName) {
    throw new Error(`${EntityClass.name} is not an entity. Did you decorate it with @Entity('<table>')?`);
  }

  const keys = Object.values(schema.columns).filter(c => c.primaryKey).map(c => c.name);
  if (keys.length !== 1) {
    throw new Error(
      `Entity "${schema.tableName}" must declare exactly one @PrimaryKey(), found ${keys.length}` +
      (keys.length ? ` (${keys.join(', ')})` : ''),
    );
  }

  return {
    tableName: schema.tableName,
    columns: { ...schema.columns, ...AUTO_TRAIL_COLUMNS },
    primaryKey: keys[0],
  };
}

/**
 * DDL for a set of entities, one statement per line, ready to be written to a
 * migration file (e.g. `wrangler d1 migrations`).
 */
export function schemaSql(entities: SqlEntity[]): string {
  return entities
    .map(resolveSchema)
    .map(schema => `${createTableSql(schema.tableName, schema)};`)
    .join('\n') + '\n';
}

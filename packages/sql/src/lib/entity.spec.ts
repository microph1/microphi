import { describe, expect, test } from 'vitest';
import {
  Column, Entity, JsonColumn, PrimaryKey, SqlStorage, createTableSql, getEntityClasses, getEntitySchema,
  inferType, resolveSchema, schemaSql,
} from './entity';
import { SqliteStorage } from './sqlite-storage';
import { NodeSqliteDriver } from './drivers/node-sqlite.driver';

@Entity('things')
class Thing {
  @PrimaryKey()
  id!: string;

  @Column()
  label!: string;

  @Column()
  count!: number;

  @Column()
  active!: boolean;

  @Column()
  tags!: string[];

  @Column()
  meta!: object;

  @Column()
  seen!: Date;

  @Column({ type: 'TEXT', nullable: false, default: 'it\'s' })
  quoted!: string;

  @Column({ type: 'BOOLEAN', default: true })
  flag!: boolean;

  @Column({ type: 'REAL', default: 1.5 })
  ratio!: number;

  @Column({ type: 'TEXT', default: null })
  maybe!: string;

  @JsonColumn()
  extra!: unknown;
}

describe('entity decorators', () => {
  test('infer column types from design:type', () => {
    const { columns } = getEntitySchema(Thing)!;
    expect(columns['label'].type).toBe('TEXT');
    expect(columns['count'].type).toBe('INTEGER');
    expect(columns['active'].type).toBe('BOOLEAN');
    expect(columns['tags'].type).toBe('JSON');
    expect(columns['meta'].type).toBe('JSON');
    // Regression: `if (Array)` used to send every non-primitive to JSON.
    expect(columns['seen'].type).toBe('TEXT');
    expect(inferType({}, 'missing')).toBe('TEXT');
  });

  test('createTableSql quotes identifiers and renders defaults as literals', () => {
    expect(createTableSql('things', getEntitySchema(Thing)!)).toBe(
      'CREATE TABLE IF NOT EXISTS "things" (' +
      '"id" TEXT PRIMARY KEY NOT NULL, "label" TEXT, "count" INTEGER, "active" INTEGER, "tags" TEXT, "meta" TEXT, ' +
      '"seen" TEXT, "quoted" TEXT NOT NULL DEFAULT \'it\'\'s\', "flag" INTEGER DEFAULT 1, "ratio" REAL DEFAULT 1.5, ' +
      '"maybe" TEXT DEFAULT NULL, "extra" TEXT)',
    );
  });

  test('schemaSql emits one statement per entity, auto-trail included', () => {
    expect(schemaSql([Thing])).toMatch(/^CREATE TABLE IF NOT EXISTS "things" \(.*"created" TEXT, "modified" TEXT\);\n$/);
  });

  test('a subclass entity does not leak columns into its parent', () => {
    @Entity('base')
    class Base {
      @PrimaryKey() id!: string;
    }

    @Entity('derived')
    class Derived extends Base {
      @Column({ type: 'TEXT' }) extra!: string;
    }

    expect(Object.keys(getEntitySchema(Base)!.columns)).toEqual(['id']);
    expect(Object.keys(getEntitySchema(Derived)!.columns)).toEqual(['extra']);
  });

  test('resolveSchema requires @Entity and exactly one @PrimaryKey', () => {
    class Plain {}

    @Entity('keyless')
    class Keyless {
      @Column({ type: 'TEXT' }) name!: string;
    }

    @Entity('twokeys')
    class TwoKeys {
      @PrimaryKey() a!: string;
      @PrimaryKey() b!: string;
    }

    expect(() => resolveSchema(Plain)).toThrow('Plain is not an entity. Did you decorate it with @Entity(\'<table>\')?');
    expect(() => resolveSchema(Keyless)).toThrow('Entity "keyless" must declare exactly one @PrimaryKey(), found 0');
    expect(() => resolveSchema(TwoKeys)).toThrow('Entity "twokeys" must declare exactly one @PrimaryKey(), found 2 (a, b)');
  });

  test('a storage needs @SqlStorage', () => {
    class Bare extends SqliteStorage {
      constructor() {
        super(NodeSqliteDriver.open(':memory:'));
      }
    }

    expect(getEntityClasses(Bare)).toEqual([]);
    expect(() => new Bare()).toThrow('Bare manages no entities. Did you decorate it with @SqlStorage([...])?');
  });

  test('migrate creates the declared tables', async () => {
    @SqlStorage([Thing])
    class Things extends SqliteStorage {
      constructor(readonly sqlite: NodeSqliteDriver) {
        super(sqlite);
      }
    }

    const driver = NodeSqliteDriver.open(':memory:');
    const things = new Things(driver);
    await things.migrate();
    await things.migrate(); // idempotent

    const tables = driver.db.prepare('SELECT name FROM sqlite_master WHERE type = \'table\'').all();
    expect(tables).toEqual([{ name: 'things' }]);
    await things.close();
  });
});

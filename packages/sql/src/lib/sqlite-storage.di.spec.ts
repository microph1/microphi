import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { Injectable, injector, TestBed } from '@microphi/di';
import { Column, Entity, PrimaryKey, SqlStorage } from './entity.js';
import { SqlDriver } from './driver.js';
import { SqliteStorage } from './sqlite-storage.js';
import { NodeSqliteDriver } from './drivers/node-sqlite.driver.js';

@Entity('notes')
class Note {
  @PrimaryKey()
  id = '';

  @Column({ type: 'TEXT' })
  text = '';
}

@SqlStorage([Note])
@Injectable()
class Notes extends SqliteStorage {}

class MemoryDb extends NodeSqliteDriver {
  constructor() {
    super(':memory:');
  }
}

describe('SqliteStorage with @microphi/di', () => {

  beforeEach(() => {
    TestBed.configure({ providers: [{ provide: SqlDriver, useClass: MemoryDb }, Notes] });
  });

  test('injects the driver provided for SqlDriver', async () => {
    const notes = injector(Notes);

    await notes.migrate();
    await notes.upsert([Object.assign(new Note(), { id: 'a', text: 'hello' })]);

    expect(await notes.get<Note>('a')).toMatchObject({ id: 'a', text: 'hello' });
    expect(injector(SqlDriver)).toBeInstanceOf(MemoryDb);
  });

  test('says which provider is missing when no driver is provided', () => {
    TestBed.configure({ providers: [Notes] });

    expect(() => injector(Notes)).toThrow(/SqlDriver is not provided/);
  });
});

describe('NodeSqliteDriver', () => {
  const dir = mkdtempSync(join(tmpdir(), 'microphi-sql-'));

  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  test('opens a path given to the constructor, creating its directory', async () => {
    const driver = new NodeSqliteDriver(join(dir, 'nested', 'app.db'));

    await driver.run('CREATE TABLE t (x INTEGER)');
    expect(await driver.all('SELECT * FROM t')).toEqual([]);
    driver.close();
  });
});

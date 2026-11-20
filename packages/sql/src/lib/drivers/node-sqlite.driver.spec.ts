import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { NodeSqliteDriver } from './node-sqlite.driver';

describe('NodeSqliteDriver', () => {
  const dirs: string[] = [];

  afterEach(() => {
    dirs.splice(0).forEach(dir => rmSync(dir, { recursive: true, force: true }));
  });

  test('open creates the parent directory of a database file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'microphi-sql-'));
    dirs.push(dir);
    const path = join(dir, 'nested', 'deeper', 'test.db');

    const driver = NodeSqliteDriver.open(path);
    await driver.run('CREATE TABLE t (x INTEGER)');
    driver.close();

    expect(existsSync(path)).toBe(true);
  });

  test('batch rolls back every statement when one fails', async () => {
    const driver = NodeSqliteDriver.open(':memory:');
    await driver.run('CREATE TABLE t (x INTEGER NOT NULL)');

    await expect(driver.batch([
      { sql: 'INSERT INTO t (x) VALUES (?)', params: [1] },
      { sql: 'INSERT INTO t (x) VALUES (?)', params: [null] },
    ])).rejects.toThrow();

    expect(await driver.first('SELECT COUNT(*) AS n FROM t')).toEqual({ n: 0 });
    await driver.batch([]);
    driver.close();
  });

  test('run reports changes', async () => {
    const driver = NodeSqliteDriver.open(':memory:');
    await driver.run('CREATE TABLE t (x INTEGER)');
    await driver.batch([1, 2, 3].map(x => ({ sql: 'INSERT INTO t (x) VALUES (?)', params: [x] })));

    expect(await driver.run('DELETE FROM t WHERE x > ?', [1])).toEqual({ changes: 2 });
    expect(await driver.first('SELECT x FROM t WHERE x = ?', [9])).toBeUndefined();
    driver.close();
  });
});

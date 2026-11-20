import { createClient, Client } from '@libsql/client';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { migrate } from './libsql-migrate.js';

describe('migrate (libSQL)', () => {
  let dir: string;
  let client: Client;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'microphi-migrate-'));
    await writeFile(join(dir, '0001_schema.sql'), 'CREATE TABLE "a" ("id" TEXT PRIMARY KEY);\nCREATE TABLE "b" ("id" TEXT PRIMARY KEY);');
    await writeFile(join(dir, '0002_seed.sql'), 'INSERT INTO "a" ("id") VALUES (\'x\');');
    await writeFile(join(dir, 'notes.txt'), 'not a migration');
    client = createClient({ url: `file:${join(dir, 'db.sqlite')}` });
  });

  afterEach(async () => {
    client.close();
    await rm(dir, { recursive: true, force: true });
  });

  const names = async () => (await client.execute('SELECT "name" FROM "_migrations" ORDER BY "name"')).rows.map((r) => r[0]);

  test('applies pending files in name order, once', async () => {
    expect(await migrate(client, dir)).toEqual(['0001_schema.sql', '0002_seed.sql']);
    expect(await migrate(client, dir)).toEqual([]);
    expect((await client.execute('SELECT "id" FROM "a"')).rows.map((r) => r[0])).toEqual(['x']);
    expect(await names()).toEqual(['0001_schema.sql', '0002_seed.sql']);
  });

  test('a failing file applies nothing of itself, and stops the run', async () => {
    await writeFile(join(dir, '0003_bad.sql'), 'INSERT INTO "b" ("id") VALUES (\'y\');\nINSERT INTO "nope" VALUES (1);');
    await expect(migrate(client, dir)).rejects.toThrow(/migration 0003_bad.sql failed/);
    expect(await names()).toEqual(['0001_schema.sql', '0002_seed.sql']);
    expect((await client.execute('SELECT count(*) FROM "b"')).rows[0][0]).toBe(0);
  });
});

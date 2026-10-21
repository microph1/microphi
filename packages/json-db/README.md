# @microphi/json-db [![npm](https://img.shields.io/npm/v/@microphi/json-db)](https://www.npmjs.com/package/@microphi/json-db)

> Small file-based JSON database with full-text search ([minisearch](https://github.com/lucaong/minisearch))

## Install

```sh
npm i @microphi/json-db @microphi/list minisearch rxjs
```

Node only: documents are stored on the file system.

## How to use

```typescript
import { JsonStorage } from '@microphi/json-db';

interface User {
  id: string;
  name: string;
}

// stores users under .data/users/
const users = new JsonStorage<User>('users', '.data');

await users.upsert({ id: '1', name: 'superman' }, { id: '2', name: 'batman' });

const batman = await users.get('2');
await users.upsert({ id: '2', name: 'super-batman' }); // update

users.has('1');      // true
users.getCount();    // 2
await users.getAll();

await users.remove('1');
await users.deleteAll();
```

Each document is saved as `<basePath>/<entity>/<id>.json`. An `index.json` next to them tracks every document's path and its `created` / `modified` timestamps.

### Full-text search

Pass [minisearch options](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html#constructor) as the third argument to index documents as they are written:

```typescript
const users = new JsonStorage<User>('users', '.data', {
  fields: ['name'],
  idField: 'id',
});

users.search('batman', { fields: ['name'] });
```

Documents are added, updated and removed from the search index automatically.

### Index writes

Index updates are queued through RxJS and `index.json` is written after 3 seconds of inactivity, so bursts of writes don't hit the disk on every change.

```typescript
new JsonStorage<User>(
  'users',
  '.data',
  searchOptions, // optional
  1_000,         // index write debounce in ms, default 3000
  scheduler,     // RxJS scheduler for the debounce, default asapScheduler
);
```

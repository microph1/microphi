# @microphi/list [![npm](https://img.shields.io/npm/v/@microphi/list)](https://www.npmjs.com/package/@microphi/list)

> List with array ordering and direct lookup by id (Map + id array)

Internally a `Map` of entities plus an array of ids: iteration follows the array's order, lookups by id go straight to the map.

## Install

```sh
npm i @microphi/list rxjs
```

## How to use

```typescript
import { List } from '@microphi/list';

interface User {
  id: string;
  name: string;
}

// the id field, and optionally the initial items
const users = new List<User>('id', [
  { id: 'a', name: 'alice' },
  { id: 'b', name: 'bob' },
]);

users.get('a');   // { id: 'a', name: 'alice' }
users.has('c');   // false
users.size;       // 2

for (const user of users) { /* in list order */ }
[...users].map((u) => u.name);
```

### Adding and removing

All methods accept one or more items.

| Method | New id | Existing id |
|---|---|---|
| `upsert(...items)` | appended | replaced in place |
| `append(...items)` | appended | replaced and moved to the end |
| `prepend(...items)` | added at the start | replaced and moved to the start |
| `delete(...items)` | — | removed |
| `clear()` | | removes everything |

### Watching changes

Every mutation emits on `operations$`:

```typescript
users.operations$.subscribe(({ op, payload, timestamp }) => {
  console.log(op, payload); // 'upsert' | 'append' | 'prepend' | 'delete' | 'clear'
});
```

# @microphi/json-db [![npm version](https://badge.fury.io/js/%40microphi%2Fjsob-db.svg)](https://badge.fury.io/js/%40microphi%2Fjson-db)

> Small, fast and simple file based json-db super powered by [minisearch](https://github.com/lucaong/minisearch)

## Install
With your preferend package manager install
```
@microphi/json-db
```

## How to use
### Basic usage:
```typescript
interface User {
  id: string;
  name: string;
}

// create a new storage for User
const storage = new JsonStorage<User>('users', '.data');

await storage.upsert({id: '1', name:'superman'});
await storage.upsert({id: '2', name:'batman'});

// getting a document by id
const batman = await storage.get('2');
// updating a document
await storage.upsert({id: '2', name: 'super-batman'});

// get all documents
const docs = await storage.getAll();

// remove a document
await storage.remove('1');

// remove all documents
await storage.deleteAll();

```
A directory with the name provided (in this case `.data`) will be created and inside there another folder with the entity name.
Data is save in `json` files as in `${id}.json` and an `index.json` will collect all stored documents metadata such as modified date and create date.

### Enable minisearch
To enable minisearch create instantiate a storage class such as
```typescript
const storage = new JsonStorage<User>('users', '.data', {
  fields: ['name'],
  idField: 'id',
});
```
The third object in the JsonStorage constructor is the `Options` object of minisearch which documentation can be found [here](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html#constructor)

JsonStorage uses internally rxjs to queue the operations on the index and so to avoid too many read/write to occur simultaneously. By default `index.json` is written on disk after 3 second of inactivity. This can be changed using the fourth argument of the constructor specifying the time in milliseconds. Also a fifth argument can be passed to change the default rxjs scheduler (asapScheduler).

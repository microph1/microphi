# @microphi/json-db — notes for coding agents

File-based JSON document store with full-text search. Full docs: [README.md](README.md).

## Rules

- Node only: documents are files under `<basePath>/<entity>/<id>.json`.
- `new JsonStorage<T>(entity, basePath, searchOptions?, indexDebounceMs?, scheduler?)`; documents need an `id` field.
- `upsert`, `get`, `getAll`, `remove`, `deleteAll` are async: await them. `has` and `getCount` are sync.
- `index.json` is written after `indexDebounceMs` (default 3 s) of inactivity: a process that exits right after a write can lose the index update. In tests pass a small debounce or a `TestScheduler`/virtual scheduler.
- Search only works when `searchOptions` (minisearch options, with `fields` and `idField`) were given to the constructor.
- Use a temporary `basePath` in tests and delete it afterwards.

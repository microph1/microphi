# @microphi/list — notes for coding agents

Ordered collection with O(1) lookup by id. Full docs: [README.md](README.md); every error code: [ERRORS.md](ERRORS.md).

## Rules

- `new List<T>('id', items?)`: the first argument is the name of the id field.
- Change it only through `upsert`, `append`, `prepend`, `delete`, `clear`. Never write to `entities` directly: ids and entities get out of sync (`LIST001`, `LIST002`).
- `upsert` keeps an existing item's position; `append`/`prepend` move it.
- Iterate with `for...of` or `[...list]` (list order); `get(id)`/`has(id)` for lookups.
- Every mutation emits `{ op, payload, timestamp }` on `operations$`.

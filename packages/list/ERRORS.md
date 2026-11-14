# @microphi/list errors

Every error the list throws is a `ListError`: `error.code` is one of the codes below, and the message starts with the code and ends with a link here.

## LIST001

**Iterating hit an id with no entity.**

The id array and the entity map are out of sync.

Fix: change the list only through its methods; never write to `entities` (or the ids) directly.

## LIST002

**`size` found the id array and the entity map with different sizes.**

Same cause and fix as [LIST001](#list001).

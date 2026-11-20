# @microphi/ngx-shortcuts errors

Every error the library throws is a `ShortcutsError`: `error.code` is one of the codes below, and the message starts with the code and ends with a link here.

## SHORTCUTS001

**A binding has no key.**

Thrown by `register()`, `registerShortcuts()`, `parseShortcut()` and the formatting functions for an empty binding (`''`) or one that ends with modifiers (`'mod+'`).

Fix: end every chord with a key: `'mod+k'`, `'escape'`, `'?'`. To bind the plus key, write `'mod++'` or `'mod+plus'`.

## SHORTCUTS002

**A binding uses something that is not a modifier.**

Everything before the last `+` of a chord must be one of `mod`, `ctrl` (`control`), `alt` (`option`, `opt`), `shift`, `meta` (`cmd`, `command`, `super`, `win`).

```typescript
{ keys: 'g+p' }   // wrong: "g" is not a modifier
{ keys: 'g p' }   // a sequence: g, then p
```

Fix: correct the modifier, or separate the keys of a sequence with a space.

## SHORTCUTS003

**A shortcut has no keys.**

Thrown by `register()` and `registerShortcuts()` for `keys: []`.

Fix: give it at least one binding, or don't register it.

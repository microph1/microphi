# @microphi/ngx-shortcuts — notes for coding agents

Keyboard shortcuts for Angular 17+. Full docs: [README.md](README.md); every error code: [ERRORS.md](ERRORS.md).

## Rules

- Register from a component, directive or service with `registerShortcuts([...])` in the constructor or a field initializer: the shortcuts are removed when it is destroyed. Outside an injection context use `inject(Shortcuts).register(defs, destroyRef)` or keep the returned handle and call `unregister()`.
- Never add your own `document`/`window` `keydown` listener for a shortcut, and never `@HostListener('document:keydown')`: register it, so it shows in the help overlay and obeys the typing guard.
- Write bindings as `mod+k` (⌘ on Mac, Ctrl elsewhere), not `ctrl+k`, unless the gesture must be Ctrl on a Mac too. Sequences are space-separated: `g p`. `?` and `shift+?` are the same binding.
- Bare and shift-only keys never fire while focus is in a field. A `mod+…` or `escape` shortcut that must work inside fields (save, close) needs `allowInInputs: true`.
- Don't bind browser-reserved combos (Ctrl/⌘ + T, W, N, L, D, H, P, U, F, R, Q, Tab; Ctrl/⌘ + Shift + N, T, W); dev mode warns about them.
- A page overriding an app-wide binding just registers the same gesture: the newest registration wins while it lives. Use `when: () => ...` for a binding that applies only in some state, not `if` inside the action (a `when()` that is false lets the key reach older bindings and the browser).
- `preventDefault` defaults to true. Set it to false only when the browser's own behaviour must still happen.
- For a help dialog or command palette read `inject(Shortcuts).active` (signal) and format keys with the `shortcutKeys` pipe; `<ngx-shortcuts-help />` is the ready-made one.

## Testing

Use `pressShortcut('mod+k')` / `pressShortcut('g p')` / `pressShortcut('k', { target: input })` from `@microphi/ngx-shortcuts/testing`; it presses for the platform given to `provideShortcuts({ platform })` in `TestBed`. Pin the platform in tests (`'other'` or `'mac'`) so they don't depend on the machine. Sequence timeouts use `Date.now()`: advance fake timers between chords.

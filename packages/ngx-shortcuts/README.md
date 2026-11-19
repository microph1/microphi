# @microphi/ngx-shortcuts [![npm](https://img.shields.io/npm/v/@microphi/ngx-shortcuts)](https://www.npmjs.com/package/@microphi/ngx-shortcuts)

> Keyboard shortcuts for Angular: `mod+k` bindings, `g p` sequences, typing-safe, scoped to components, with a help overlay

- one `keydown` listener for the whole app
- `mod` is ⌘ on a Mac and Ctrl elsewhere, and is displayed that way
- bare keys never fire while the user is typing in a field
- a component's shortcuts go away with the component, and shadow the app's while it lives
- `?` opens a ready-made help overlay (native `<dialog>`, no Material), or build your own from a signal

Angular 17 to 22, standalone or NgModule, SSR-safe.

## Install

```sh
npm i @microphi/ngx-shortcuts
```

## How to use

### Register shortcuts

From a component, directive or service, in an injection context. They are unregistered when it is destroyed.

```typescript
import { registerShortcuts } from '@microphi/ngx-shortcuts';

@Component({ /* ... */ })
export class PlayerComponent {
  constructor() {
    registerShortcuts([
      { keys: 'space', description: 'Play / pause', group: 'Player', action: () => this.toggle() },
      { keys: ['alt+arrowup', 'shift+arrowup'], description: 'Volume up', group: 'Player', action: () => this.volume(+1) },
      { keys: 'g l', description: 'Go to library', group: 'Navigation', action: () => this.router.navigate(['/library']) },
    ]);
  }
}
```

Anywhere else, use the service; pass a `DestroyRef` to tie the shortcuts to it, or keep the handle:

```typescript
const shortcuts = inject(Shortcuts);

const registration = shortcuts.register({ keys: 'mod+k', description: 'Search', action: () => this.openSearch() });
registration.unregister();
```

### Bindings

| Binding | Means |
|---|---|
| `mod+k` | ⌘K on a Mac, Ctrl+K elsewhere |
| `ctrl+k`, `meta+k`, `alt+k`, `shift+k` | exactly that modifier (aliases: `cmd`, `option`, `control`) |
| `escape`, `enter`, `space`, `tab`, `arrowup`, `f1`... | named keys, as `KeyboardEvent.key` spells them (aliases: `esc`, `up`, `return`) |
| `?`, `/`, `+` | the character, whatever modifiers the layout needs to type it: `?` and `shift+?` are the same |
| `g p` | a sequence: `g`, then `p` within a second |

Keys match `KeyboardEvent.key` case-insensitively. When the layout types something that is not a latin letter or digit (⌥K on a Mac types `˚`, Ctrl+K on a Cyrillic layout types `л`) the physical key (`event.code`) is used instead. Auto-repeat repeats single-chord shortcuts, never sequences.

A malformed binding throws a `ShortcutsError` (see [ERRORS.md](ERRORS.md)).

### Options

```typescript
{
  keys: 'escape',
  description: 'Close the panel',
  action: (event?: KeyboardEvent) => this.close(),
  group: 'Panel',               // heading in the help overlay
  when: () => this.isOpen(),    // checked on each press; when false the press goes to older bindings
  preventDefault: true,         // default: cancel the browser's default (and the key's keyup)
  allowInInputs: true,          // default false, see below
}
```

### Typing in fields

While focus is in an `input`, `textarea`, `select`, a `contenteditable` or a `role="textbox"`:

- bare and shift-only keys never fire, nor do sequences;
- single chords holding Ctrl or ⌘ (`mod+s`) and `escape` fire only with `allowInInputs: true`.

### Overriding and scoping

The newest registration of a gesture wins while it is alive: a page registering `mod+k` overrides the app's, and the app's is back when the page is destroyed. `mod+k` and `ctrl+k` are the same gesture on Linux and Windows. A registration with `when()` only overrides while `when()` is true.

Registering a gesture twice in the same scope (one `register()` call, or the same `DestroyRef`) warns in dev mode.

Shortcuts claim their keys over focused controls: a `space` shortcut runs instead of clicking the focused `<button>` (the keyup is cancelled too). Keys another handler already cancelled (an open menu, a dialog) are left alone.

### Help overlay

Put it once in the app shell; `?` toggles it:

```html
<ngx-shortcuts-help />

<!-- another key, a heading, or no key and open it yourself -->
<ngx-shortcuts-help key="f1" heading="Keys" />
<ngx-shortcuts-help #help [key]="null" />
<button (click)="help.open()">Shortcuts</button>
```

It is a native modal `<dialog>`: focus is trapped and restored, Escape and a backdrop click close it. Restyle it with custom properties:

```css
ngx-shortcuts-help {
  --ngx-shortcuts-help-bg: #1e1e1e;
  --ngx-shortcuts-help-fg: #eee;
  --ngx-shortcuts-help-muted: #999;
  --ngx-shortcuts-help-border: #333;
  --ngx-shortcuts-help-divider: #2a2a2a;
  --ngx-shortcuts-help-radius: 8px;
  --ngx-shortcuts-help-width: 40rem;
  --ngx-shortcuts-help-padding: 1.5rem;
  --ngx-shortcuts-help-shadow: none;
  --ngx-shortcuts-help-font: inherit;
  --ngx-shortcuts-help-backdrop: rgb(0 0 0 / 0.6);
  --ngx-shortcuts-help-accent: #7c4dff;
  --ngx-shortcuts-help-kbd-bg: #2a2a2a;
  --ngx-shortcuts-help-kbd-fg: inherit;
  --ngx-shortcuts-help-kbd-border: #444;
  --ngx-shortcuts-help-kbd-font: 0.8rem monospace;
}
```

The defaults use the `Canvas`/`CanvasText` system colours, so it follows the page's `color-scheme`.

### Your own help dialog or command palette

`Shortcuts.active` (a signal) and `Shortcuts.active$` list what is registered, in registration order, without the shadowed keys:

```typescript
readonly commands = inject(Shortcuts).active; // Signal<readonly ActiveShortcut[]>

// { keys: ['mod+k'], description: 'Search', group?: string, shortcut, run(): boolean }
this.commands().find((c) => c.description === 'Search')?.run();
```

Render keys with the pipe or the functions behind it:

```html
<kbd>{{ command.keys | shortcutKeys }}</kbd>   <!-- ⌘K on a Mac, Ctrl+K elsewhere; G then P -->
```

```typescript
formatShortcut('mod+shift+k', 'mac');    // '⇧⌘K'
formatShortcutChords('g p', 'other');    // ['G', 'P']
```

### Configure

Optional. Standalone:

```typescript
bootstrapApplication(AppComponent, {
  providers: [provideShortcuts({ sequenceTimeout: 800 })],
});
```

NgModule: `ShortcutsModule.forRoot(config)` in the root module, `ShortcutsModule` where the pipe or the overlay is used (both are standalone and can be imported directly too).

| Option | Default | |
|---|---|---|
| `platform` | detected | `'mac'` or `'other'`; `other` on the server |
| `sequenceTimeout` | `1000` | ms allowed between the keys of a sequence |
| `warnOnReserved` | `true` | warn in dev mode about browser-reserved combos |

## Browser-reserved combos

Don't bind these; the library binds nothing but the overlay's `?`, and warns in dev mode when you do:

- Ctrl/⌘ + T, W, N, Q, Tab, and Ctrl/⌘ + Shift + N, T, W, Tab: new tab/window, close, quit, switch tab. Browsers never deliver most of them to the page.
- Ctrl/⌘ + L, D, H, P, U, F, R, and Ctrl/⌘ + Shift + Delete: address bar, bookmark, history, print, view source, find, reload, clear data. They reach the page and can be cancelled, but users expect the browser's behaviour.

Prefer `mod+k`, `mod+enter`, `mod+/`, `alt+…`, bare keys and sequences (`g h`).

## Testing

`@microphi/ngx-shortcuts/testing` presses bindings the way a user would, on the focused element by default and for the platform configured in `TestBed`:

```typescript
import { pressShortcut } from '@microphi/ngx-shortcuts/testing';

TestBed.configureTestingModule({ providers: [provideShortcuts({ platform: 'mac' })] });

const [keydown] = pressShortcut('mod+k');           // ⌘K
expect(keydown.defaultPrevented).toBe(true);

pressShortcut('g p');                               // each chord in turn
pressShortcut('k', { target: input });              // typing in a field
pressShortcut('arrowup', { repeat: true });         // auto-repeat
```

The sequence clock is `Date.now()`: fake timers advance it.

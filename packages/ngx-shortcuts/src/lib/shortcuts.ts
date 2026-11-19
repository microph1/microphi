import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  assertInInjectionContext,
  DestroyRef,
  inject,
  Injectable,
  isDevMode,
  NgZone,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  canonicalShortcut,
  detectPlatform,
  isReservedChord,
  matchesChord,
  parseShortcut,
  ShortcutChord,
  ShortcutsPlatform,
} from './binding';
import { SHORTCUTS_CONFIG } from './config';
import { ShortcutsError } from './errors';

export interface Shortcut {
  /** one or more bindings: `'mod+k'`, `['?', 'shift+/']`, `'g p'` */
  keys: string | readonly string[];
  /** what it does, shown in the help overlay and command palettes */
  description: string;
  /** heading it is listed under in the help overlay */
  group?: string;
  /** receives the keydown event, or nothing when run from a command palette */
  action: (event?: KeyboardEvent) => void;
  /** evaluated on each key press; when it returns false the press falls through to older bindings */
  when?: () => boolean;
  /** cancel the browser's default for the key (and its keyup); default true */
  preventDefault?: boolean;
  /**
   * fire while focus is in an input, textarea, select or contenteditable.
   * Only honoured for single chords holding Ctrl or ⌘ (`mod+s`) and for
   * `escape`: bare and shift-only keys are what the user is typing.
   */
  allowInInputs?: boolean;
}

/** a registered shortcut as listed by {@link Shortcuts.active} */
export interface ActiveShortcut {
  /** its bindings as written, minus the ones a newer registration shadows */
  readonly keys: readonly string[];
  readonly description: string;
  readonly group?: string;
  readonly shortcut: Shortcut;
  /** runs the action unless `when()` says no; returns whether it ran */
  run(): boolean;
}

export interface ShortcutsRegistration {
  /** removes the shortcuts; idempotent */
  unregister(): void;
}

interface Binding {
  readonly shortcut: Shortcut;
  readonly binding: string;
  readonly chords: readonly ShortcutChord[];
  readonly canonical: string;
  readonly scope: object;
}

const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'AltGraph', 'Meta', 'OS', 'CapsLock', 'Fn', 'FnLock', 'Hyper', 'Super']);

// input types that do not take text: shortcuts keep working while they are focused
const NON_TEXT_INPUTS = new Set(['button', 'checkbox', 'color', 'file', 'image', 'radio', 'range', 'reset', 'submit']);

const LOG = '[@microphi/ngx-shortcuts]';

function isEditable(event: KeyboardEvent): boolean {
  // composedPath()[0] is the real target inside a shadow root; event.target is its host
  const target = (typeof event.composedPath === 'function' && event.composedPath()[0]) || event.target;
  const el = target as HTMLElement | null;
  if (!el || typeof el.tagName !== 'string') {
    return false;
  }

  const tag = el.tagName.toLowerCase();
  if (tag === 'textarea' || tag === 'select') {
    return true;
  }
  if (tag === 'input') {
    return !NON_TEXT_INPUTS.has((el as HTMLInputElement).type);
  }
  if (el.isContentEditable || el.closest?.('[contenteditable=""],[contenteditable="true"],[contenteditable="plaintext-only"]')) {
    return true;
  }
  const role = el.getAttribute?.('role');
  return role === 'textbox' || role === 'searchbox' || role === 'combobox';
}

/**
 * The shortcut registry: one keydown listener on the document for the whole app.
 *
 * The newest registration of a gesture wins while it is alive, so a page can
 * override an app-wide binding and get it back when it is destroyed.
 */
@Injectable({ providedIn: 'root' })
export class Shortcuts {
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly config = inject(SHORTCUTS_CONFIG, { optional: true }) ?? {};

  /** the platform `mod` resolves for */
  readonly platform: ShortcutsPlatform = this.config.platform
    ?? (this.browser ? detectPlatform(this.document.defaultView?.navigator) : 'other');

  private readonly sequenceTimeout = this.config.sequenceTimeout ?? 1000;
  private readonly warnOnReserved = this.config.warnOnReserved ?? true;

  private bindings: Binding[] = [];

  private readonly _active = signal<readonly ActiveShortcut[]>([]);
  /** registered shortcuts in registration order, for help overlays and command palettes */
  readonly active = this._active.asReadonly();

  private readonly _active$ = new BehaviorSubject<readonly ActiveShortcut[]>([]);
  /** {@link active} as an Observable */
  readonly active$ = this._active$.asObservable();

  // keys of a sequence typed so far, and when the last one was
  private pending: KeyboardEvent[] = [];
  private pendingAt = 0;

  // keys whose keydown a shortcut consumed: their keyup is cancelled too, which
  // is what stops a focused <button> from activating on Space in every browser
  private readonly consumedKeyUps = new Set<string>();

  private listening = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopListening());
  }

  /**
   * Registers shortcuts. Pass a `DestroyRef` (or use {@link registerShortcuts})
   * to unregister them automatically when the component or service is destroyed.
   *
   * A gesture registered twice in one scope (one call, or calls passing the same
   * `DestroyRef` instance) warns in dev mode; across scopes the newest one wins.
   */
  register(shortcuts: Shortcut | readonly Shortcut[], destroyRef?: DestroyRef): ShortcutsRegistration {
    const list = (Array.isArray(shortcuts) ? shortcuts : [shortcuts]) as readonly Shortcut[];
    const scope: object = destroyRef ?? {};
    const added: Binding[] = [];

    // validate everything first: a malformed binding must not leave half a registration behind
    for (const shortcut of list) {
      const keys = typeof shortcut.keys === 'string' ? [shortcut.keys] : [...shortcut.keys];
      if (keys.length === 0) {
        throw new ShortcutsError('SHORTCUTS003', `shortcut "${shortcut.description}" has no keys; give it at least one binding such as "mod+k".`);
      }

      for (const binding of new Set(keys)) {
        const chords = parseShortcut(binding);
        const canonical = canonicalShortcut(chords, this.platform);
        this.warnIfSuspicious(shortcut, binding, chords, canonical, scope, added);
        added.push({ shortcut, binding, chords, canonical, scope });
      }
    }

    this.bindings.push(...added);
    this.publish();
    this.listen();

    let registered = true;
    const unregister = () => {
      if (!registered) {
        return;
      }
      registered = false;
      this.bindings = this.bindings.filter((b) => !added.includes(b));
      this.publish();
    };

    destroyRef?.onDestroy(unregister);

    return { unregister };
  }

  private warnIfSuspicious(
    shortcut: Shortcut,
    binding: string,
    chords: readonly ShortcutChord[],
    canonical: string,
    scope: object,
    added: readonly Binding[],
  ): void {
    if (!isDevMode()) {
      return;
    }

    const duplicate = [...this.bindings, ...added].find((b) => b.scope === scope && b.canonical === canonical);
    if (duplicate) {
      console.warn(
        `${LOG} "${binding}" (${shortcut.description}) is registered twice in the same scope; it replaces "${duplicate.binding}" (${duplicate.shortcut.description}).`,
      );
    }

    if (this.warnOnReserved && chords.some(isReservedChord)) {
      console.warn(
        `${LOG} "${binding}" (${shortcut.description}) is a browser shortcut: it may never reach the page, and overriding it surprises users. Prefer another key or a sequence.`,
      );
    }
  }

  private publish(): void {
    // a binding is shadowed by a newer, unconditional one of the same gesture
    const taken = new Set<string>();
    const visible = new Set<Binding>();
    for (let i = this.bindings.length - 1; i >= 0; i--) {
      const b = this.bindings[i];
      if (!taken.has(b.canonical)) {
        visible.add(b);
        if (!b.shortcut.when) {
          taken.add(b.canonical);
        }
      }
    }

    const byShortcut = new Map<Shortcut, string[]>();
    for (const b of this.bindings) {
      const keys = byShortcut.get(b.shortcut) ?? [];
      if (visible.has(b)) {
        keys.push(b.binding);
      }
      byShortcut.set(b.shortcut, keys);
    }

    const active: ActiveShortcut[] = [];
    for (const [shortcut, keys] of byShortcut) {
      if (keys.length) {
        active.push({
          keys,
          description: shortcut.description,
          group: shortcut.group,
          shortcut,
          run: () => {
            if (shortcut.when && !shortcut.when()) {
              return false;
            }
            this.zone.run(() => shortcut.action());
            return true;
          },
        });
      }
    }

    this._active.set(active);
    this._active$.next(active);
  }

  private listen(): void {
    if (this.listening || !this.browser) {
      return;
    }
    this.listening = true;
    // change detection runs only when an action does, inside the zone
    this.zone.runOutsideAngular(() => {
      this.document.addEventListener('keydown', this.onKeyDown);
      this.document.addEventListener('keyup', this.onKeyUp, true);
    });
  }

  private stopListening(): void {
    if (this.listening) {
      this.document.removeEventListener('keydown', this.onKeyDown);
      this.document.removeEventListener('keyup', this.onKeyUp, true);
      this.listening = false;
    }
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    // somebody (an open menu, a dialog) already handled this key
    if (event.defaultPrevented || event.isComposing || MODIFIER_KEYS.has(event.key)) {
      return;
    }

    const editable = isEditable(event);
    const now = Date.now();

    if (this.pending.length && (editable || now - this.pendingAt > this.sequenceTimeout)) {
      this.pending = [];
    }

    // holding a key repeats single-chord shortcuts but never advances a sequence
    if (event.repeat) {
      this.handle([event], editable, now, false);
      return;
    }

    if (this.pending.length && this.handle([...this.pending, event], editable, now, true)) {
      return;
    }
    this.pending = [];
    this.handle([event], editable, now, true);
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    if (this.consumedKeyUps.delete(event.code || event.key)) {
      event.preventDefault();
    }
  };

  /** fires the shortcut `typed` completes, or remembers `typed` as the start of a sequence */
  private handle(typed: readonly KeyboardEvent[], editable: boolean, now: number, sequences: boolean): boolean {
    const event = typed[typed.length - 1];
    // only called with bindings at least as long as `typed`
    const matches = (b: Binding) => typed.every((e, i) => matchesChord(b.chords[i], e, this.platform));

    for (let i = this.bindings.length - 1; i >= 0; i--) {
      const b = this.bindings[i];
      if (b.chords.length === typed.length
        && this.allowed(b, editable)
        && matches(b)
        && (!b.shortcut.when || b.shortcut.when())) {
        this.pending = [];
        this.fire(b, event);
        return true;
      }
    }

    if (!sequences || editable) {
      return false;
    }

    const started = this.bindings.filter((b) => b.chords.length > typed.length && matches(b));
    if (started.length === 0) {
      return false;
    }

    this.pending = [...typed];
    this.pendingAt = now;
    if (started.some((b) => b.shortcut.preventDefault !== false)) {
      event.preventDefault();
    }
    return true;
  }

  private allowed(b: Binding, editable: boolean): boolean {
    if (!editable) {
      return true;
    }
    if (!b.shortcut.allowInInputs || b.chords.length !== 1) {
      return false;
    }
    const [chord] = b.chords;
    return chord.mod || chord.ctrl || chord.meta || chord.key === 'escape';
  }

  private fire(b: Binding, event: KeyboardEvent): void {
    if (b.shortcut.preventDefault !== false) {
      event.preventDefault();
      this.consumedKeyUps.add(event.code || event.key);
    }
    this.zone.run(() => b.shortcut.action(event));
  }
}

/**
 * Registers shortcuts for the lifetime of the current component, directive or
 * service. Call it in an injection context (a constructor or field initializer).
 */
export function registerShortcuts(shortcuts: Shortcut | readonly Shortcut[]): ShortcutsRegistration {
  assertInInjectionContext(registerShortcuts);
  return inject(Shortcuts).register(shortcuts, inject(DestroyRef));
}

import { ShortcutsError } from './errors';

/** `mac` renders and resolves `mod` as ⌘, `other` as Ctrl. */
export type ShortcutsPlatform = 'mac' | 'other';

/** One key press of a binding: `mod+shift+k` is one chord, `g p` is two. */
export interface ShortcutChord {
  /** normalized `KeyboardEvent.key`, lower case: `k`, `?`, `escape`, `arrowup`, `space` */
  readonly key: string;
  /** ⌘ on Mac, Ctrl elsewhere */
  readonly mod: boolean;
  readonly ctrl: boolean;
  readonly alt: boolean;
  readonly shift: boolean;
  readonly meta: boolean;
}

/** a chord with `mod` resolved for a platform */
interface ResolvedChord {
  readonly key: string;
  readonly ctrl: boolean;
  readonly alt: boolean;
  readonly shift: boolean;
  readonly meta: boolean;
}

const MODIFIERS: Record<string, 'mod' | 'ctrl' | 'alt' | 'shift' | 'meta'> = {
  mod: 'mod',
  ctrl: 'ctrl', control: 'ctrl',
  alt: 'alt', option: 'alt', opt: 'alt',
  shift: 'shift',
  meta: 'meta', cmd: 'meta', command: 'meta', super: 'meta', win: 'meta',
};

// both the binding syntax and old browsers (`Esc`, `Up`, `Spacebar`) spell keys differently
const KEY_ALIASES: Record<string, string> = {
  ' ': 'space',
  spacebar: 'space',
  esc: 'escape',
  return: 'enter',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  del: 'delete',
  ins: 'insert',
  pgup: 'pageup',
  pgdn: 'pagedown',
  plus: '+',
};

/** normalizes a binding key or a `KeyboardEvent.key` to the form chords are compared in */
export function normalizeKey(key: string): string {
  // `' '` must survive the lower-casing; everything else is case-insensitive
  const lower = key === ' ' ? key : key.toLowerCase();
  return KEY_ALIASES[lower] ?? lower;
}

/**
 * A single printable character that is neither a letter nor a digit (`?`, `/`, `!`).
 * Which modifiers produce it depends on the keyboard layout, so `shift` is never
 * part of how it matches: `?` and `shift+?` are the same binding.
 */
function isSymbolKey(key: string): boolean {
  return key.length === 1 && !/[a-z0-9]/.test(key);
}

function parseChord(chord: string, binding: string): ShortcutChord {
  let key: string;
  let modifiers: string[];

  if (chord === '+') {
    key = '+';
    modifiers = [];
  } else if (chord.endsWith('++')) {
    key = '+';
    modifiers = chord.slice(0, -2).split('+');
  } else {
    modifiers = chord.split('+');
    key = modifiers.pop() as string;
  }

  if (!key) {
    throw new ShortcutsError('SHORTCUTS001', `binding "${binding}" has no key after its modifiers; write it like "mod+k".`);
  }

  const flags = { mod: false, ctrl: false, alt: false, shift: false, meta: false };
  for (const token of modifiers) {
    const modifier = MODIFIERS[token.toLowerCase()];
    if (!modifier) {
      throw new ShortcutsError(
        'SHORTCUTS002',
        `"${token}" in binding "${binding}" is not a modifier; use mod, ctrl, alt, shift or meta, and separate the keys of a sequence with a space ("g p").`,
      );
    }
    flags[modifier] = true;
  }

  const normalized = normalizeKey(key);
  if (isSymbolKey(normalized)) {
    flags.shift = false;
  }

  return { key: normalized, ...flags };
}

/**
 * Parses a binding string into its chords.
 *
 * `mod+k`, `shift+?`, `alt+arrowup`, `escape`, `/`, and sequences such as `g p`
 * (chords separated by whitespace). Throws a `ShortcutsError` on a malformed binding.
 */
export function parseShortcut(binding: string): ShortcutChord[] {
  const chords = binding.trim().split(/\s+/).filter(Boolean);
  if (chords.length === 0) {
    throw new ShortcutsError('SHORTCUTS001', `binding "${binding}" is empty; write it like "mod+k" or "g p".`);
  }
  return chords.map((chord) => parseChord(chord, binding));
}

function resolveChord(chord: ShortcutChord, platform: ShortcutsPlatform): ResolvedChord {
  return {
    key: chord.key,
    ctrl: chord.ctrl || (chord.mod && platform !== 'mac'),
    alt: chord.alt,
    shift: chord.shift,
    meta: chord.meta || (chord.mod && platform === 'mac'),
  };
}

/**
 * The platform-resolved form of a binding: `mod+k` is `ctrl+k` on Linux and
 * Windows and `meta+k` on a Mac. Two bindings with the same canonical form are
 * the same physical gesture, which is what shadowing compares.
 */
export function canonicalShortcut(chords: readonly ShortcutChord[], platform: ShortcutsPlatform): string {
  return chords.map((chord) => {
    const r = resolveChord(chord, platform);
    return [r.ctrl && 'ctrl', r.alt && 'alt', r.shift && 'shift', r.meta && 'meta', r.key]
      .filter(Boolean)
      .join('+');
  }).join(' ');
}

const ALNUM = /^[a-z0-9]$/;

function codeFor(key: string): string {
  return /[0-9]/.test(key) ? `Digit${key}` : `Key${key.toUpperCase()}`;
}

/** whether a keydown event is the given chord */
export function matchesChord(chord: ShortcutChord, event: KeyboardEvent, platform: ShortcutsPlatform): boolean {
  const r = resolveChord(chord, platform);

  // AltGr arrives as Ctrl+Alt on Windows: the character it types is the key, not a Ctrl+Alt chord
  const altGraph = typeof event.getModifierState === 'function' && event.getModifierState('AltGraph');
  const ctrl = event.ctrlKey && !altGraph;
  const alt = event.altKey && !altGraph;

  if (ctrl !== r.ctrl || alt !== r.alt || event.metaKey !== r.meta) {
    return false;
  }
  if (!isSymbolKey(r.key) && event.shiftKey !== r.shift) {
    return false;
  }

  const key = normalizeKey(event.key ?? '');
  if (key === r.key) {
    return true;
  }

  // ⌥K on a Mac types "˚" and Ctrl+K on a Cyrillic layout types "л": when the
  // layout did not produce a latin letter or digit, fall back to the physical key.
  return ALNUM.test(r.key) && !ALNUM.test(key) && event.code === codeFor(r.key);
}

const MAC_SYMBOLS = { ctrl: '⌃', alt: '⌥', shift: '⇧', meta: '⌘' };
const OTHER_NAMES = { ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift', meta: 'Meta' };

const KEY_LABELS: Record<string, [mac: string, other: string]> = {
  escape: ['Esc', 'Esc'],
  enter: ['↩', 'Enter'],
  space: ['Space', 'Space'],
  tab: ['⇥', 'Tab'],
  backspace: ['⌫', 'Backspace'],
  delete: ['⌦', 'Del'],
  arrowup: ['↑', '↑'],
  arrowdown: ['↓', '↓'],
  arrowleft: ['←', '←'],
  arrowright: ['→', '→'],
  pageup: ['PgUp', 'PgUp'],
  pagedown: ['PgDn', 'PgDn'],
};

function keyLabel(key: string, platform: ShortcutsPlatform): string {
  const label = KEY_LABELS[key];
  if (label) {
    return platform === 'mac' ? label[0] : label[1];
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function formatChord(chord: ShortcutChord, platform: ShortcutsPlatform): string {
  const r = resolveChord(chord, platform);
  const modifiers = (['ctrl', 'alt', 'shift', 'meta'] as const).filter((m) => r[m]);
  const key = keyLabel(r.key, platform);

  if (platform === 'mac') {
    return modifiers.map((m) => MAC_SYMBOLS[m]).join('') + key;
  }
  return [...modifiers.map((m) => OTHER_NAMES[m]), key].join('+');
}

/**
 * Renders a binding for humans, one string per chord: `mod+k` is `['⌘K']` on a
 * Mac and `['Ctrl+K']` elsewhere, `g p` is `['G', 'P']`.
 */
export function formatShortcutChords(binding: string, platform: ShortcutsPlatform): string[] {
  return parseShortcut(binding).map((chord) => formatChord(chord, platform));
}

/** Renders a binding for humans: `⌘K` / `Ctrl+K`, sequences as `G then P`. */
export function formatShortcut(binding: string, platform: ShortcutsPlatform): string {
  return formatShortcutChords(binding, platform).join(' then ');
}

interface NavigatorLike {
  readonly platform?: string;
  readonly userAgent?: string;
  readonly userAgentData?: { readonly platform?: string };
}

/** `mac` on macOS and iOS (where ⌘ is the primary modifier), `other` elsewhere and on the server. */
export function detectPlatform(navigator?: NavigatorLike | null): ShortcutsPlatform {
  if (!navigator) {
    return 'other';
  }
  const platform = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || '';
  return /mac|iphone|ipad|ipod/i.test(platform) ? 'mac' : 'other';
}

const RESERVED_KEYS = new Set(['t', 'w', 'n', 'l', 'd', 'h', 'p', 'u', 'f', 'r', 'q', 'tab']);
const RESERVED_SHIFT_KEYS = new Set(['n', 't', 'w', 'tab', 'delete']);

/**
 * Whether a chord is one browsers keep for themselves (new tab, close window,
 * address bar, print...): Ctrl/⌘ + T, W, N, L, D, H, P, U, F, R, Q, Tab and
 * Ctrl/⌘ + Shift + N, T, W, Tab, Delete. Some never reach the page at all, the
 * rest work only by overriding what users expect from their browser.
 */
export function isReservedChord(chord: ShortcutChord): boolean {
  const primary = chord.mod || chord.ctrl || chord.meta;
  if (!primary || chord.alt) {
    return false;
  }
  return chord.shift ? RESERVED_SHIFT_KEYS.has(chord.key) : RESERVED_KEYS.has(chord.key);
}

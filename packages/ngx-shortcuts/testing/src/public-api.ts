import { TestBed } from '@angular/core/testing';
import { parseShortcut, ShortcutChord, Shortcuts, ShortcutsPlatform } from '@microphi/ngx-shortcuts';

export interface PressShortcutOptions {
  /** where the keys are pressed; default the focused element, else `document.body` */
  target?: EventTarget;
  /** platform `mod` is pressed for; default the `Shortcuts` platform from TestBed, else `other` */
  platform?: ShortcutsPlatform;
  /** mark the keydowns as auto-repeat */
  repeat?: boolean;
  /** also dispatch the keyup after each keydown; default true */
  keyup?: boolean;
}

const EVENT_KEYS: Record<string, string> = {
  escape: 'Escape',
  enter: 'Enter',
  space: ' ',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Delete',
  insert: 'Insert',
  arrowup: 'ArrowUp',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  home: 'Home',
  end: 'End',
};

// US layout: where each symbol lives and whether it needs Shift
const SYMBOL_CODES: Record<string, [code: string, shift: boolean]> = {
  '/': ['Slash', false], '?': ['Slash', true],
  '.': ['Period', false], '>': ['Period', true],
  ',': ['Comma', false], '<': ['Comma', true],
  ';': ['Semicolon', false], ':': ['Semicolon', true],
  '\'': ['Quote', false], '"': ['Quote', true],
  '[': ['BracketLeft', false], '{': ['BracketLeft', true],
  ']': ['BracketRight', false], '}': ['BracketRight', true],
  '\\': ['Backslash', false], '|': ['Backslash', true],
  '-': ['Minus', false], '_': ['Minus', true],
  '=': ['Equal', false], '+': ['Equal', true],
  '`': ['Backquote', false], '~': ['Backquote', true],
  '!': ['Digit1', true], '@': ['Digit2', true], '#': ['Digit3', true], '$': ['Digit4', true],
  '%': ['Digit5', true], '^': ['Digit6', true], '&': ['Digit7', true], '*': ['Digit8', true],
  '(': ['Digit9', true], ')': ['Digit0', true],
};

/** the `KeyboardEvent` a US-layout keyboard produces for a chord */
export function keyboardEventInit(chord: ShortcutChord, platform: ShortcutsPlatform): KeyboardEventInit {
  let key = chord.key;
  let code = '';
  let shift = chord.shift;

  if (/^[a-z]$/.test(key)) {
    code = `Key${key.toUpperCase()}`;
    key = shift ? key.toUpperCase() : key;
  } else if (/^[0-9]$/.test(key)) {
    code = `Digit${key}`;
  } else if (/^f([1-9]|1[0-2])$/.test(key)) {
    key = code = key.toUpperCase();
  } else if (EVENT_KEYS[key]) {
    key = EVENT_KEYS[key];
    code = key === ' ' ? 'Space' : key;
  } else if (SYMBOL_CODES[key]) {
    [code, shift] = SYMBOL_CODES[key];
  }

  return {
    key,
    code,
    ctrlKey: chord.ctrl || (chord.mod && platform !== 'mac'),
    metaKey: chord.meta || (chord.mod && platform === 'mac'),
    altKey: chord.alt,
    shiftKey: shift,
    bubbles: true,
    cancelable: true,
    composed: true,
  };
}

function testBedPlatform(): ShortcutsPlatform {
  try {
    return TestBed.inject(Shortcuts).platform;
  } catch {
    return 'other';
  }
}

/**
 * Presses a binding the way a user would: `pressShortcut('mod+k')`,
 * `pressShortcut('g p')` (each chord in turn), `pressShortcut('?', { target: input })`.
 * Returns the keydown events, so a test can assert on `defaultPrevented`.
 *
 * For a sequence timeout, press the chords one at a time and advance fake timers
 * (the clock is `Date.now()`) in between.
 */
export function pressShortcut(binding: string, options: PressShortcutOptions = {}): KeyboardEvent[] {
  const platform = options.platform ?? testBedPlatform();
  const target = options.target ?? document.activeElement ?? document.body;

  return parseShortcut(binding).map((chord) => {
    const init = keyboardEventInit(chord, platform);
    const keydown = new KeyboardEvent('keydown', { ...init, repeat: !!options.repeat });
    target.dispatchEvent(keydown);
    if (options.keyup !== false) {
      target.dispatchEvent(new KeyboardEvent('keyup', init));
    }
    return keydown;
  });
}

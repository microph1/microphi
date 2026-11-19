import {
  canonicalShortcut,
  detectPlatform,
  formatShortcut,
  formatShortcutChords,
  isReservedChord,
  matchesChord,
  normalizeKey,
  parseShortcut,
} from './binding';
import { ShortcutsError } from './errors';

function keydown(init: KeyboardEventInit & { altGraph?: boolean }): KeyboardEvent {
  const event = new KeyboardEvent('keydown', init);
  if (init.altGraph) {
    Object.defineProperty(event, 'getModifierState', { value: (m: string) => m === 'AltGraph' });
  }
  return event;
}

describe('parseShortcut', () => {
  it('parses modifiers and the key', () => {
    expect(parseShortcut('mod+k')).toEqual([{ key: 'k', mod: true, ctrl: false, alt: false, shift: false, meta: false }]);
    expect(parseShortcut('Ctrl+Alt+Shift+Meta+K')).toEqual([{ key: 'k', mod: false, ctrl: true, alt: true, shift: true, meta: true }]);
  });

  it('accepts modifier aliases', () => {
    expect(parseShortcut('cmd+option+control+k')[0]).toMatchObject({ meta: true, alt: true, ctrl: true });
  });

  it('normalizes key aliases', () => {
    expect(parseShortcut('esc')[0].key).toBe('escape');
    expect(parseShortcut('alt+up')[0]).toMatchObject({ key: 'arrowup', alt: true });
    expect(parseShortcut('return')[0].key).toBe('enter');
    expect(parseShortcut('mod+plus')[0].key).toBe('+');
  });

  it('drops shift from symbol keys, whose modifiers depend on the layout', () => {
    expect(parseShortcut('shift+?')).toEqual(parseShortcut('?'));
    expect(parseShortcut('shift+a')[0].shift).toBe(true);
  });

  it('parses + as a key', () => {
    expect(parseShortcut('+')[0].key).toBe('+');
    expect(parseShortcut('mod++')[0]).toMatchObject({ key: '+', mod: true });
  });

  it('parses sequences separated by whitespace', () => {
    expect(parseShortcut('  g   p ').map((c) => c.key)).toEqual(['g', 'p']);
    expect(parseShortcut('mod+k mod+s').map((c) => c.mod)).toEqual([true, true]);
  });

  it('throws SHORTCUTS001 on an empty binding or a missing key', () => {
    for (const binding of ['', '   ', 'mod+']) {
      expect(() => parseShortcut(binding)).toThrow(ShortcutsError);
      expect(() => parseShortcut(binding)).toThrow(/^SHORTCUTS001/);
    }
  });

  it('throws SHORTCUTS002 on an unknown modifier', () => {
    expect(() => parseShortcut('hyper+k')).toThrow(/^SHORTCUTS002: "hyper"/);
    // two keys in one chord: the first is read as a modifier
    expect(() => parseShortcut('g+p')).toThrow(/SHORTCUTS002/);
    try {
      parseShortcut('g+p');
    } catch (e) {
      expect((e as ShortcutsError).code).toBe('SHORTCUTS002');
      expect((e as ShortcutsError).message).toContain('ERRORS.md#shortcuts002');
    }
  });
});

describe('normalizeKey', () => {
  it('lower-cases and maps legacy key names', () => {
    expect(normalizeKey('K')).toBe('k');
    expect(normalizeKey(' ')).toBe('space');
    expect(normalizeKey('Spacebar')).toBe('space');
    expect(normalizeKey('Esc')).toBe('escape');
    expect(normalizeKey('ArrowUp')).toBe('arrowup');
  });
});

describe('canonicalShortcut', () => {
  it('resolves mod per platform', () => {
    expect(canonicalShortcut(parseShortcut('mod+k'), 'other')).toBe('ctrl+k');
    expect(canonicalShortcut(parseShortcut('mod+k'), 'mac')).toBe('meta+k');
    expect(canonicalShortcut(parseShortcut('mod+k'), 'other')).toBe(canonicalShortcut(parseShortcut('ctrl+k'), 'other'));
  });

  it('orders modifiers and keeps sequences', () => {
    expect(canonicalShortcut(parseShortcut('shift+alt+ctrl+x'), 'other')).toBe('ctrl+alt+shift+x');
    expect(canonicalShortcut(parseShortcut('g p'), 'other')).toBe('g p');
  });
});

describe('matchesChord', () => {
  const [modK] = parseShortcut('mod+k');

  it('resolves mod to Ctrl elsewhere and ⌘ on a Mac', () => {
    expect(matchesChord(modK, keydown({ key: 'k', ctrlKey: true }), 'other')).toBe(true);
    expect(matchesChord(modK, keydown({ key: 'k', metaKey: true }), 'other')).toBe(false);
    expect(matchesChord(modK, keydown({ key: 'k', metaKey: true }), 'mac')).toBe(true);
    expect(matchesChord(modK, keydown({ key: 'k', ctrlKey: true }), 'mac')).toBe(false);
  });

  it('requires the exact modifiers', () => {
    expect(matchesChord(modK, keydown({ key: 'k', ctrlKey: true, altKey: true }), 'other')).toBe(false);
    expect(matchesChord(modK, keydown({ key: 'k' }), 'other')).toBe(false);
  });

  it('matches letters case-insensitively but holds shift to account', () => {
    const [k] = parseShortcut('k');
    // caps lock
    expect(matchesChord(k, keydown({ key: 'K' }), 'other')).toBe(true);
    expect(matchesChord(k, keydown({ key: 'K', shiftKey: true }), 'other')).toBe(false);
    expect(matchesChord(parseShortcut('shift+k')[0], keydown({ key: 'K', shiftKey: true }), 'other')).toBe(true);
  });

  it('ignores shift for symbol keys', () => {
    const [question] = parseShortcut('?');
    expect(matchesChord(question, keydown({ key: '?', shiftKey: true }), 'other')).toBe(true);
    expect(matchesChord(question, keydown({ key: '?' }), 'other')).toBe(true);
    expect(matchesChord(question, keydown({ key: '/' }), 'other')).toBe(false);
  });

  it('matches named keys', () => {
    expect(matchesChord(parseShortcut('escape')[0], keydown({ key: 'Escape' }), 'other')).toBe(true);
    expect(matchesChord(parseShortcut('space')[0], keydown({ key: ' ' }), 'other')).toBe(true);
    expect(matchesChord(parseShortcut('alt+arrowup')[0], keydown({ key: 'ArrowUp', altKey: true }), 'other')).toBe(true);
  });

  it('falls back to the physical key when the layout types something else', () => {
    // ⌥K on a Mac
    expect(matchesChord(parseShortcut('alt+k')[0], keydown({ key: '˚', code: 'KeyK', altKey: true }), 'mac')).toBe(true);
    // ⌥E is a dead key on a Mac
    expect(matchesChord(parseShortcut('alt+e')[0], keydown({ key: 'Dead', code: 'KeyE', altKey: true }), 'mac')).toBe(true);
    // Ctrl+K on a Cyrillic layout
    expect(matchesChord(modK, keydown({ key: 'л', code: 'KeyK', ctrlKey: true }), 'other')).toBe(true);
    // Shift+1 types "!"
    expect(matchesChord(parseShortcut('shift+1')[0], keydown({ key: '!', code: 'Digit1', shiftKey: true }), 'other')).toBe(true);
  });

  it('does not fall back when the layout typed another latin letter (Dvorak)', () => {
    expect(matchesChord(modK, keydown({ key: 't', code: 'KeyK', ctrlKey: true }), 'other')).toBe(false);
  });

  it('treats AltGr as typing a character, not Ctrl+Alt', () => {
    const [at] = parseShortcut('@');
    expect(matchesChord(at, keydown({ key: '@', ctrlKey: true, altKey: true, altGraph: true }), 'other')).toBe(true);
    expect(matchesChord(at, keydown({ key: '@', ctrlKey: true, altKey: true }), 'other')).toBe(false);
  });
});

describe('formatShortcut', () => {
  it('renders mod as ⌘ on a Mac and Ctrl elsewhere', () => {
    expect(formatShortcut('mod+k', 'mac')).toBe('⌘K');
    expect(formatShortcut('mod+k', 'other')).toBe('Ctrl+K');
  });

  it('renders every modifier in platform order', () => {
    expect(formatShortcut('shift+alt+ctrl+meta+x', 'mac')).toBe('⌃⌥⇧⌘X');
    expect(formatShortcut('shift+alt+ctrl+meta+x', 'other')).toBe('Ctrl+Alt+Shift+Meta+X');
  });

  it('renders named keys', () => {
    expect(formatShortcut('escape', 'other')).toBe('Esc');
    expect(formatShortcut('mod+enter', 'mac')).toBe('⌘↩');
    expect(formatShortcut('mod+enter', 'other')).toBe('Ctrl+Enter');
    expect(formatShortcut('alt+arrowup', 'other')).toBe('Alt+↑');
    expect(formatShortcut('space', 'other')).toBe('Space');
    expect(formatShortcut('home', 'other')).toBe('Home');
    expect(formatShortcut('f2', 'other')).toBe('F2');
  });

  it('renders symbols without a shift', () => {
    expect(formatShortcut('shift+?', 'mac')).toBe('?');
    expect(formatShortcut('/', 'other')).toBe('/');
  });

  it('renders sequences chord by chord', () => {
    expect(formatShortcut('g p', 'other')).toBe('G then P');
    expect(formatShortcutChords('g mod+p', 'mac')).toEqual(['G', '⌘P']);
  });
});

describe('detectPlatform', () => {
  it('detects Apple platforms', () => {
    expect(detectPlatform({ platform: 'MacIntel' })).toBe('mac');
    expect(detectPlatform({ platform: 'iPhone' })).toBe('mac');
    expect(detectPlatform({ userAgentData: { platform: 'macOS' } })).toBe('mac');
    expect(detectPlatform({ platform: '', userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)' })).toBe('mac');
  });

  it('defaults to other', () => {
    expect(detectPlatform({ platform: 'Linux x86_64' })).toBe('other');
    expect(detectPlatform({ userAgentData: { platform: 'Windows' } })).toBe('other');
    expect(detectPlatform({})).toBe('other');
    expect(detectPlatform(null)).toBe('other');
    expect(detectPlatform()).toBe('other');
  });
});

describe('isReservedChord', () => {
  it.each(['mod+t', 'mod+w', 'mod+n', 'ctrl+l', 'meta+d', 'mod+h', 'mod+p', 'mod+u', 'mod+f', 'mod+r', 'mod+q', 'mod+tab', 'mod+shift+n', 'ctrl+shift+t'])(
    '%s is reserved', (binding) => {
      expect(isReservedChord(parseShortcut(binding)[0])).toBe(true);
    });

  it.each(['mod+k', 'mod+enter', 't', 'alt+t', 'mod+alt+t', 'mod+shift+k', 'shift+t'])('%s is not reserved', (binding) => {
    expect(isReservedChord(parseShortcut(binding)[0])).toBe(false);
  });
});

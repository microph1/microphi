import { TestBed } from '@angular/core/testing';
import { parseShortcut, provideShortcuts } from '@microphi/ngx-shortcuts';

import { keyboardEventInit, pressShortcut } from './public-api';

describe('keyboardEventInit', () => {
  const init = (binding: string, platform: 'mac' | 'other' = 'other') => keyboardEventInit(parseShortcut(binding)[0], platform);

  it('presses letters and digits with their codes', () => {
    expect(init('k')).toMatchObject({ key: 'k', code: 'KeyK', shiftKey: false });
    expect(init('shift+k')).toMatchObject({ key: 'K', code: 'KeyK', shiftKey: true });
    expect(init('1')).toMatchObject({ key: '1', code: 'Digit1' });
  });

  it('presses mod as Ctrl or ⌘', () => {
    expect(init('mod+k')).toMatchObject({ ctrlKey: true, metaKey: false });
    expect(init('mod+k', 'mac')).toMatchObject({ ctrlKey: false, metaKey: true });
    expect(init('ctrl+alt+meta+k', 'mac')).toMatchObject({ ctrlKey: true, altKey: true, metaKey: true });
  });

  it('presses named keys', () => {
    expect(init('space')).toMatchObject({ key: ' ', code: 'Space' });
    expect(init('esc')).toMatchObject({ key: 'Escape', code: 'Escape' });
    expect(init('arrowup')).toMatchObject({ key: 'ArrowUp', code: 'ArrowUp' });
    expect(init('f5')).toMatchObject({ key: 'F5', code: 'F5' });
  });

  it('presses symbols as a US layout types them', () => {
    expect(init('?')).toMatchObject({ key: '?', code: 'Slash', shiftKey: true });
    expect(init('/')).toMatchObject({ key: '/', code: 'Slash', shiftKey: false });
    expect(init('§')).toMatchObject({ key: '§', code: '' });
  });

  it('makes bubbling, cancelable, composed events', () => {
    expect(init('k')).toMatchObject({ bubbles: true, cancelable: true, composed: true });
  });
});

describe('pressShortcut', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('dispatches keydown and keyup on the focused element for each chord', () => {
    const input = document.body.appendChild(document.createElement('input'));
    input.focus();
    const seen: string[] = [];
    input.addEventListener('keydown', (e) => seen.push(`down:${e.key}`));
    input.addEventListener('keyup', (e) => seen.push(`up:${e.key}`));

    const events = pressShortcut('g p', { platform: 'other' });
    expect(seen).toEqual(['down:g', 'up:g', 'down:p', 'up:p']);
    expect(events.map((e) => e.type)).toEqual(['keydown', 'keydown']);
  });

  it('can skip the keyup and mark repeats', () => {
    const seen: KeyboardEvent[] = [];
    document.addEventListener('keyup', (e) => seen.push(e));
    const [down] = pressShortcut('x', { keyup: false, repeat: true, platform: 'other' });
    expect(seen).toHaveLength(0);
    expect(down.repeat).toBe(true);
  });

  it('presses for the TestBed platform by default', () => {
    TestBed.configureTestingModule({ providers: [provideShortcuts({ platform: 'mac' })] });
    const [down] = pressShortcut('mod+k');
    expect(down.metaKey).toBe(true);
  });
});

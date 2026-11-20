import { Component, DestroyRef, inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { pressShortcut } from '@microphi/ngx-shortcuts/testing';

import { provideShortcuts } from './providers';
import { ActiveShortcut, registerShortcuts, Shortcuts } from './shortcuts';
import { ShortcutsError } from './errors';

function setup(platform: 'mac' | 'other' = 'other', extra: object = {}): Shortcuts {
  TestBed.configureTestingModule({ providers: [provideShortcuts({ platform, ...extra })] });
  return TestBed.inject(Shortcuts);
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    el.setAttribute(name, value);
  }
  document.body.appendChild(el);
  return el;
}

const keys = (active: readonly ActiveShortcut[]) => active.map((a) => `${a.description}:${a.keys.join(',')}`);

describe('Shortcuts', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('matching', () => {
    it('resolves mod to Ctrl on Linux and Windows', () => {
      const shortcuts = setup('other');
      const action = jest.fn();
      shortcuts.register({ keys: 'mod+k', description: 'Search', action });

      pressShortcut('meta+k');
      expect(action).not.toHaveBeenCalled();
      pressShortcut('ctrl+k');
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('resolves mod to ⌘ on a Mac', () => {
      const shortcuts = setup('mac');
      const action = jest.fn();
      shortcuts.register({ keys: 'mod+k', description: 'Search', action });

      pressShortcut('ctrl+k');
      expect(action).not.toHaveBeenCalled();
      pressShortcut('meta+k');
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('passes the keydown event to the action', () => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register({ keys: 'escape', description: 'Close', action });

      const [event] = pressShortcut('escape');
      expect(action).toHaveBeenCalledWith(event);
    });

    it('matches any of several keys', () => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register({ keys: ['?', 'f1'], description: 'Help', action });

      pressShortcut('?');
      pressShortcut('f1');
      expect(action).toHaveBeenCalledTimes(2);
    });

    it('runs actions inside the Angular zone', () => {
      const shortcuts = setup();
      let inZone = false;
      shortcuts.register({ keys: 'x', description: 'X', action: () => inZone = NgZone.isInAngularZone() });

      pressShortcut('x');
      expect(inZone).toBe(true);
    });

    it('detects the platform from navigator when not configured', () => {
      const spy = jest.spyOn(window.navigator, 'platform', 'get').mockReturnValue('MacIntel');
      expect(TestBed.inject(Shortcuts).platform).toBe('mac');
      spy.mockRestore();
    });
  });

  describe('one listener', () => {
    it('adds a single keydown listener however many shortcuts are registered', () => {
      const add = jest.spyOn(document, 'addEventListener');
      const shortcuts = setup();
      shortcuts.register([
        { keys: 'a', description: 'A', action: jest.fn() },
        { keys: 'b', description: 'B', action: jest.fn() },
      ]);
      shortcuts.register({ keys: 'c', description: 'C', action: jest.fn() });

      expect(add.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);
      add.mockRestore();
    });

    it('removes its listeners when the app is destroyed', () => {
      const remove = jest.spyOn(document, 'removeEventListener');
      const shortcuts = setup();
      shortcuts.register({ keys: 'a', description: 'A', action: jest.fn() });

      TestBed.resetTestingModule();

      expect(remove.mock.calls.map(([type]) => type)).toEqual(expect.arrayContaining(['keydown', 'keyup']));
      remove.mockRestore();
    });
  });

  describe('default action', () => {
    it('prevents the browser default (Ctrl/⌘+K must not reach the address bar)', () => {
      const shortcuts = setup();
      shortcuts.register({ keys: 'mod+k', description: 'Search', action: jest.fn() });

      const [event] = pressShortcut('mod+k');
      expect(event.defaultPrevented).toBe(true);
    });

    it('leaves the default alone with preventDefault: false', () => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register({ keys: 'mod+k', description: 'Search', action, preventDefault: false });

      const [event] = pressShortcut('mod+k');
      expect(action).toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it('beats a focused button: cancels both the keydown and the keyup of Space', () => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register({ keys: 'space', description: 'Play', action });
      const button = element('button');
      const click = jest.fn();
      button.addEventListener('click', click);
      button.focus();

      const keyups: KeyboardEvent[] = [];
      button.addEventListener('keyup', (e) => keyups.push(e));
      const [keydown] = pressShortcut('space');

      expect(action).toHaveBeenCalledTimes(1);
      expect(keydown.defaultPrevented).toBe(true);
      expect(keyups[0].defaultPrevented).toBe(true);
      expect(click).not.toHaveBeenCalled();
    });

    it('only cancels the keyup of the key it consumed', () => {
      const shortcuts = setup();
      shortcuts.register({ keys: 'x', description: 'X', action: jest.fn() });

      const keyup = new KeyboardEvent('keyup', { key: 'y', code: 'KeyY', cancelable: true, bubbles: true });
      document.body.dispatchEvent(keyup);
      expect(keyup.defaultPrevented).toBe(false);
    });

    it('ignores keys somebody else already handled', () => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register({ keys: 'escape', description: 'Close', action });
      const menu = element('div');
      menu.addEventListener('keydown', (e) => e.preventDefault());

      pressShortcut('escape', { target: menu });
      expect(action).not.toHaveBeenCalled();
    });

    it('ignores modifier presses and IME composition', () => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register({ keys: 'g p', description: 'Go', action });

      pressShortcut('g');
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true, bubbles: true }));
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', isComposing: true, bubbles: true }));
      pressShortcut('p');
      expect(action).toHaveBeenCalledTimes(1);
    });
  });

  describe('sequences', () => {
    it('fires after all the chords, cancelling the default of each', () => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register({ keys: 'g p', description: 'Go to player', action });

      const [g] = pressShortcut('g');
      expect(g.defaultPrevented).toBe(true);
      expect(action).not.toHaveBeenCalled();
      pressShortcut('p');
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('does not cancel the defaults of a sequence with preventDefault: false', () => {
      const shortcuts = setup();
      shortcuts.register({ keys: 'g p', description: 'Go', action: jest.fn(), preventDefault: false });

      const [g, p] = pressShortcut('g p');
      expect(g.defaultPrevented).toBe(false);
      expect(p.defaultPrevented).toBe(false);
    });

    it('times out between chords', () => {
      jest.useFakeTimers();
      const shortcuts = setup('other', { sequenceTimeout: 500 });
      const action = jest.fn();
      shortcuts.register({ keys: 'g p', description: 'Go', action });

      pressShortcut('g');
      jest.advanceTimersByTime(501);
      pressShortcut('p');
      expect(action).not.toHaveBeenCalled();

      pressShortcut('g');
      jest.advanceTimersByTime(499);
      pressShortcut('p');
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('defaults to a one second timeout', () => {
      jest.useFakeTimers();
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register({ keys: 'g p', description: 'Go', action });

      pressShortcut('g');
      jest.advanceTimersByTime(1001);
      pressShortcut('p');
      expect(action).not.toHaveBeenCalled();
    });

    it('restarts on a key that breaks the sequence', () => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register({ keys: 'g p', description: 'Go', action });

      pressShortcut('g x p');
      expect(action).not.toHaveBeenCalled();
      pressShortcut('g g p');
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('lets the breaking key fire its own shortcut', () => {
      const shortcuts = setup();
      const go = jest.fn();
      const p = jest.fn();
      shortcuts.register([
        { keys: 'g h', description: 'Go home', action: go },
        { keys: 'p', description: 'Play', action: p },
      ]);

      pressShortcut('g p');
      expect(go).not.toHaveBeenCalled();
      expect(p).toHaveBeenCalledTimes(1);
    });

    it('prefers completing a sequence to a single-key shortcut', () => {
      const shortcuts = setup();
      const go = jest.fn();
      const p = jest.fn();
      shortcuts.register([
        { keys: 'p', description: 'Play', action: p },
        { keys: 'g p', description: 'Go to player', action: go },
      ]);

      pressShortcut('g p');
      expect(go).toHaveBeenCalledTimes(1);
      expect(p).not.toHaveBeenCalled();
    });

    it('distinguishes sequences sharing a prefix', () => {
      const shortcuts = setup();
      const home = jest.fn();
      const player = jest.fn();
      shortcuts.register([
        { keys: 'g h', description: 'Home', action: home },
        { keys: 'g p', description: 'Player', action: player },
      ]);

      pressShortcut('g h');
      pressShortcut('g p');
      expect(home).toHaveBeenCalledTimes(1);
      expect(player).toHaveBeenCalledTimes(1);
    });

    it('ignores auto-repeat for sequences but not for single keys', () => {
      const shortcuts = setup();
      const go = jest.fn();
      const volume = jest.fn();
      shortcuts.register([
        { keys: 'g p', description: 'Go', action: go },
        { keys: 'arrowup', description: 'Volume up', action: volume },
      ]);

      pressShortcut('g');
      pressShortcut('p', { repeat: true });
      expect(go).not.toHaveBeenCalled();
      // the held key did not break the pending sequence either
      pressShortcut('p');
      expect(go).toHaveBeenCalledTimes(1);

      pressShortcut('g', { repeat: true });
      pressShortcut('p');
      expect(go).toHaveBeenCalledTimes(1);

      pressShortcut('arrowup', { repeat: true });
      pressShortcut('arrowup', { repeat: true });
      expect(volume).toHaveBeenCalledTimes(2);
    });

    it('falls back to a single key when the completed sequence is disabled by when()', () => {
      const shortcuts = setup();
      const go = jest.fn();
      const p = jest.fn();
      shortcuts.register([
        { keys: 'p', description: 'Play', action: p },
        { keys: 'g p', description: 'Go', action: go, when: () => false },
      ]);

      pressShortcut('g p');
      expect(go).not.toHaveBeenCalled();
      expect(p).toHaveBeenCalledTimes(1);
    });
  });

  describe('typing safety', () => {
    const editables: [string, () => HTMLElement][] = [
      ['input', () => element('input')],
      ['input[type=search]', () => element('input', { type: 'search' })],
      ['textarea', () => element('textarea')],
      ['select', () => element('select')],
      ['contenteditable', () => element('div', { contenteditable: 'true' })],
      ['inside contenteditable', () => element('div', { contenteditable: '' }).appendChild(document.createElement('span'))],
      ['role=textbox', () => element('div', { role: 'textbox' })],
      ['role=combobox', () => element('div', { role: 'combobox' })],
    ];

    it.each(editables)('bare and shift keys never fire in %s', (_, create) => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register([
        { keys: 'k', description: 'K', action },
        { keys: '?', description: 'Help', action, allowInInputs: true },
        { keys: 'shift+k', description: 'K', action, allowInInputs: true },
      ]);
      const target = create();

      const events = [...pressShortcut('k', { target }), ...pressShortcut('?', { target }), ...pressShortcut('shift+k', { target })];
      expect(action).not.toHaveBeenCalled();
      expect(events.some((e) => e.defaultPrevented)).toBe(false);
    });

    it('mod shortcuts do not fire in inputs unless they opt in', () => {
      const shortcuts = setup();
      const search = jest.fn();
      const save = jest.fn();
      shortcuts.register([
        { keys: 'mod+k', description: 'Search', action: search },
        { keys: 'mod+s', description: 'Save', action: save, allowInInputs: true },
      ]);
      const input = element('input');

      const [k] = pressShortcut('mod+k', { target: input });
      expect(search).not.toHaveBeenCalled();
      expect(k.defaultPrevented).toBe(false);

      const [s] = pressShortcut('mod+s', { target: input });
      expect(save).toHaveBeenCalledTimes(1);
      expect(s.defaultPrevented).toBe(true);
    });

    it('escape can opt in', () => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register({ keys: 'escape', description: 'Close', action, allowInInputs: true });

      pressShortcut('escape', { target: element('textarea') });
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('alt shortcuts cannot opt in: Option types characters on a Mac', () => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register({ keys: 'alt+k', description: 'K', action, allowInInputs: true });

      pressShortcut('alt+k', { target: element('input') });
      expect(action).not.toHaveBeenCalled();
    });

    it('sequences never fire in inputs and are abandoned when typing starts', () => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register({ keys: 'mod+k mod+s', description: 'Chord', action, allowInInputs: true });
      const input = element('input');

      pressShortcut('mod+k mod+s', { target: input });
      expect(action).not.toHaveBeenCalled();

      pressShortcut('mod+k');
      pressShortcut('mod+s', { target: input });
      expect(action).not.toHaveBeenCalled();
    });

    it('keeps working on non-text inputs', () => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register({ keys: 'k', description: 'K', action });

      pressShortcut('k', { target: element('input', { type: 'checkbox' }) });
      pressShortcut('k', { target: element('input', { type: 'range' }) });
      expect(action).toHaveBeenCalledTimes(2);
    });

    it('sees inputs inside a shadow root', () => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register({ keys: 'k', description: 'K', action });
      const host = element('div');
      const input = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('input'));

      pressShortcut('k', { target: input });
      expect(action).not.toHaveBeenCalled();
    });
  });

  describe('scoping', () => {
    it('a newer registration shadows an older one and gives it back on unregister', () => {
      const shortcuts = setup();
      const app = jest.fn();
      const page = jest.fn();
      shortcuts.register({ keys: 'mod+k', description: 'Search', action: app });
      const pageScope = shortcuts.register({ keys: 'ctrl+k', description: 'Search this page', action: page });

      pressShortcut('mod+k');
      expect(page).toHaveBeenCalledTimes(1);
      expect(app).not.toHaveBeenCalled();
      expect(keys(shortcuts.active())).toEqual(['Search this page:ctrl+k']);

      pageScope.unregister();
      pressShortcut('mod+k');
      expect(app).toHaveBeenCalledTimes(1);
      expect(keys(shortcuts.active())).toEqual(['Search:mod+k']);
    });

    it('a conditional registration falls through to the older one when when() is false', () => {
      const shortcuts = setup();
      const app = jest.fn();
      const panel = jest.fn();
      let panelOpen = false;
      shortcuts.register({ keys: 'escape', description: 'Back', action: app });
      shortcuts.register({ keys: 'escape', description: 'Close panel', action: panel, when: () => panelOpen });

      pressShortcut('escape');
      expect(app).toHaveBeenCalledTimes(1);
      panelOpen = true;
      pressShortcut('escape');
      expect(panel).toHaveBeenCalledTimes(1);
      expect(app).toHaveBeenCalledTimes(1);
      // both can apply, so both are listed
      expect(keys(shortcuts.active())).toEqual(['Back:escape', 'Close panel:escape']);
    });

    it('lists only the keys that are not shadowed', () => {
      const shortcuts = setup();
      shortcuts.register({ keys: ['?', 'f1'], description: 'Help', action: jest.fn() });
      shortcuts.register({ keys: 'f1', description: 'Page help', action: jest.fn() });

      expect(keys(shortcuts.active())).toEqual(['Help:?', 'Page help:f1']);
    });

    it('unregister is idempotent', () => {
      const shortcuts = setup();
      const registration = shortcuts.register({ keys: 'x', description: 'X', action: jest.fn() });
      shortcuts.register({ keys: 'y', description: 'Y', action: jest.fn() });

      registration.unregister();
      registration.unregister();
      expect(keys(shortcuts.active())).toEqual(['Y:y']);
    });

    it('unregisters with the component that registered', () => {
      const page = jest.fn();

      @Component({ standalone: true, template: '' })
      class PageComponent {
        constructor() {
          registerShortcuts({ keys: 'mod+k', description: 'Search this page', action: page });
        }
      }

      const shortcuts = setup();
      const app = jest.fn();
      shortcuts.register({ keys: 'mod+k', description: 'Search', action: app });

      const fixture = TestBed.createComponent(PageComponent);
      pressShortcut('mod+k');
      expect(page).toHaveBeenCalledTimes(1);

      fixture.destroy();
      pressShortcut('mod+k');
      expect(app).toHaveBeenCalledTimes(1);
      expect(page).toHaveBeenCalledTimes(1);
    });

    it('unregisters with a destroyed service', () => {
      @Injectable()
      class PlayerKeys {
        constructor() {
          inject(Shortcuts).register({ keys: 'space', description: 'Play', action: jest.fn() }, inject(DestroyRef));
        }
      }

      @Component({ standalone: true, template: '', providers: [PlayerKeys] })
      class HostComponent {
        readonly keys = inject(PlayerKeys);
      }

      const shortcuts = setup();
      const fixture = TestBed.createComponent(HostComponent);
      expect(shortcuts.active()).toHaveLength(1);
      fixture.destroy();
      expect(shortcuts.active()).toHaveLength(0);
    });

    it('registerShortcuts throws outside an injection context', () => {
      expect(() => registerShortcuts({ keys: 'x', description: 'X', action: jest.fn() })).toThrow(/injection context/);
    });

    it('warns about a duplicate in the same scope, not across scopes', () => {
      const shortcuts = setup();
      shortcuts.register([
        { keys: 'mod+k', description: 'Search', action: jest.fn() },
        { keys: 'ctrl+k', description: 'Find', action: jest.fn() },
      ]);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"ctrl+k" (Find) is registered twice in the same scope; it replaces "mod+k" (Search)'));

      warn.mockClear();
      shortcuts.register({ keys: 'mod+k', description: 'Page search', action: jest.fn() });
      expect(warn).not.toHaveBeenCalled();
    });

    it('treats registrations sharing a DestroyRef as one scope', () => {
      @Injectable()
      class PlayerKeys {
        private readonly destroyRef = inject(DestroyRef);
        private readonly shortcuts = inject(Shortcuts);

        constructor() {
          this.shortcuts.register({ keys: 'x', description: 'One', action: jest.fn() }, this.destroyRef);
          this.shortcuts.register({ keys: 'x', description: 'Two', action: jest.fn() }, this.destroyRef);
        }
      }

      TestBed.configureTestingModule({ providers: [PlayerKeys] });
      TestBed.inject(PlayerKeys);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('registered twice'));
    });

    it('does not warn about the same shortcut listing a key twice', () => {
      const shortcuts = setup();
      shortcuts.register({ keys: ['x', 'x'], description: 'X', action: jest.fn() });
      expect(warn).not.toHaveBeenCalled();
      expect(keys(shortcuts.active())).toEqual(['X:x']);
    });
  });

  describe('validation', () => {
    it('warns about browser-reserved combos', () => {
      const shortcuts = setup();
      shortcuts.register({ keys: 'mod+t', description: 'Go to artist', action: jest.fn() });
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"mod+t" (Go to artist) is a browser shortcut'));
    });

    it('does not warn about reserved combos when told not to', () => {
      const shortcuts = setup('other', { warnOnReserved: false });
      shortcuts.register({ keys: 'mod+t', description: 'Go to artist', action: jest.fn() });
      expect(warn).not.toHaveBeenCalled();
    });

    it('throws SHORTCUTS003 for a shortcut without keys', () => {
      const shortcuts = setup();
      expect(() => shortcuts.register({ keys: [], description: 'Nothing', action: jest.fn() })).toThrow(ShortcutsError);
      expect(() => shortcuts.register({ keys: [], description: 'Nothing', action: jest.fn() })).toThrow(/^SHORTCUTS003/);
    });

    it('registers nothing when one binding is malformed', () => {
      const shortcuts = setup();
      expect(() => shortcuts.register([
        { keys: 'x', description: 'X', action: jest.fn() },
        { keys: 'foo+y', description: 'Y', action: jest.fn() },
      ])).toThrow(/SHORTCUTS002/);
      expect(shortcuts.active()).toHaveLength(0);
    });
  });

  describe('exclusive', () => {
    it('lets only the given registration fire until released', () => {
      const shortcuts = setup();
      const page = jest.fn();
      const modal = jest.fn();
      shortcuts.register({ keys: 'k', description: 'Page', action: page });
      const modalKeys = shortcuts.register({ keys: 'escape', description: 'Close', action: modal });

      const release = shortcuts.exclusive(modalKeys);
      const [k] = pressShortcut('k');
      pressShortcut('escape');
      expect(page).not.toHaveBeenCalled();
      expect(k.defaultPrevented).toBe(false);
      expect(modal).toHaveBeenCalledTimes(1);

      release();
      release();
      pressShortcut('k');
      expect(page).toHaveBeenCalledTimes(1);
    });

    it('blocks everything without a registration, sequences included', () => {
      const shortcuts = setup();
      const action = jest.fn();
      shortcuts.register([
        { keys: 'x', description: 'X', action },
        { keys: 'g p', description: 'Go', action },
      ]);

      pressShortcut('g');
      const release = shortcuts.exclusive();
      pressShortcut('p');
      pressShortcut('x');
      const [g] = pressShortcut('g');
      expect(g.defaultPrevented).toBe(false);
      expect(action).not.toHaveBeenCalled();

      release();
      pressShortcut('p');
      expect(action).not.toHaveBeenCalled();
      pressShortcut('g p');
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('nests: the latest layer wins until it is released', () => {
      const shortcuts = setup();
      const outer = jest.fn();
      const inner = jest.fn();
      const outerKeys = shortcuts.register({ keys: 'a', description: 'Outer', action: outer });
      const innerKeys = shortcuts.register({ keys: 'b', description: 'Inner', action: inner });

      const releaseOuter = shortcuts.exclusive(outerKeys);
      const releaseInner = shortcuts.exclusive(innerKeys);
      pressShortcut('a');
      pressShortcut('b');
      expect(outer).not.toHaveBeenCalled();
      expect(inner).toHaveBeenCalledTimes(1);

      releaseInner();
      pressShortcut('a');
      pressShortcut('b');
      expect(outer).toHaveBeenCalledTimes(1);
      expect(inner).toHaveBeenCalledTimes(1);
      releaseOuter();
    });

    it('does not change the active list', () => {
      const shortcuts = setup();
      shortcuts.register({ keys: 'k', description: 'Page', action: jest.fn() });
      shortcuts.exclusive();
      expect(shortcuts.active()).toHaveLength(1);
    });
  });

  describe('active list', () => {
    it('is a signal and an observable in registration order', async () => {
      const shortcuts = setup();
      shortcuts.register([
        { keys: 'mod+k', description: 'Search', group: 'Navigation', action: jest.fn() },
        { keys: 'space', description: 'Play', group: 'Player', action: jest.fn() },
      ]);

      expect(shortcuts.active().map((a) => [a.description, a.group])).toEqual([['Search', 'Navigation'], ['Play', 'Player']]);
      expect(await firstValueFrom(shortcuts.active$)).toBe(shortcuts.active());
    });

    it('run() runs the action in the zone unless when() says no', () => {
      const shortcuts = setup();
      const action = jest.fn(() => expect(NgZone.isInAngularZone()).toBe(true));
      let enabled = false;
      shortcuts.register({ keys: 'x', description: 'X', action, when: () => enabled });

      const [x] = shortcuts.active();
      expect(x.run()).toBe(false);
      enabled = true;
      expect(x.run()).toBe(true);
      expect(action).toHaveBeenCalledWith();
    });
  });

  describe('on the server', () => {
    it('keeps the registry but never touches the document', () => {
      const add = jest.spyOn(document, 'addEventListener');
      TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
      const shortcuts = TestBed.inject(Shortcuts);
      const action = jest.fn();
      shortcuts.register({ keys: 'mod+k', description: 'Search', action });

      expect(shortcuts.platform).toBe('other');
      expect(shortcuts.active()).toHaveLength(1);
      expect(add).not.toHaveBeenCalledWith('keydown', expect.anything());
      pressShortcut('mod+k');
      expect(action).not.toHaveBeenCalled();
      add.mockRestore();
    });
  });
});

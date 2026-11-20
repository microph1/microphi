import { TestBed } from '@angular/core/testing';

import { provideShortcuts } from './providers';
import { ShortcutKeysPipe } from './shortcut-keys.pipe';

function pipe(platform: 'mac' | 'other'): ShortcutKeysPipe {
  TestBed.configureTestingModule({ providers: [provideShortcuts({ platform })] });
  return TestBed.runInInjectionContext(() => new ShortcutKeysPipe());
}

describe('ShortcutKeysPipe', () => {
  it('formats for the platform', () => {
    expect(pipe('mac').transform('mod+shift+k')).toBe('⇧⌘K');
  });

  it('formats elsewhere', () => {
    expect(pipe('other').transform('mod+shift+k')).toBe('Ctrl+Shift+K');
  });

  it('joins several bindings and formats sequences', () => {
    expect(pipe('other').transform(['?', 'g h'])).toBe('? / G then H');
  });

  it('renders nothing for null', () => {
    const p = pipe('other');
    expect(p.transform(null)).toBe('');
    expect(p.transform(undefined)).toBe('');
  });
});

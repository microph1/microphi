import { Component, NgModule, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { pressShortcut } from '@microphi/ngx-shortcuts/testing';

import { provideShortcuts, ShortcutsModule } from './providers';
import { Shortcuts } from './shortcuts';
import { ShortcutsHelpComponent } from './shortcuts-help.component';

@Component({
  standalone: true,
  imports: [ShortcutsHelpComponent],
  template: '<button id="outside">outside</button><ngx-shortcuts-help [key]="key" [heading]="heading" group="General" #help />',
})
class HostComponent {
  key: string | null = '?';
  heading = 'Keyboard shortcuts';
}

function dialogOf(fixture: ComponentFixture<unknown>): HTMLDialogElement {
  return fixture.nativeElement.querySelector('dialog');
}

// text nodes joined by a space: templates are compiled without whitespace between elements
function words(el: Element): string {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const parts: string[] = [];
  while (walker.nextNode()) {
    const value = walker.currentNode.textContent?.trim();
    if (value) {
      parts.push(value);
    }
  }
  return parts.join(' ');
}

function text(fixture: ComponentFixture<unknown>): string {
  return words(dialogOf(fixture));
}

describe('ShortcutsHelpComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let shortcuts: Shortcuts;

  function create(platform: 'mac' | 'other' = 'other') {
    TestBed.configureTestingModule({ providers: [provideShortcuts({ platform })] });
    shortcuts = TestBed.inject(Shortcuts);
    shortcuts.register([
      { keys: 'mod+k', description: 'Search', group: 'Navigation', action: jest.fn() },
      { keys: 'g p', description: 'Go to player', group: 'Navigation', action: jest.fn() },
      { keys: ['space', 'k'], description: 'Play / pause', group: 'Player', action: jest.fn() },
    ]);
    fixture = TestBed.createComponent(HostComponent);
    fixture.autoDetectChanges(true);
    document.body.appendChild(fixture.nativeElement);
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('with the jsdom dialog (no showModal)', () => {
    beforeEach(() => create());

    it('renders nothing until opened', () => {
      expect(dialogOf(fixture).hasAttribute('open')).toBe(false);
      expect(text(fixture)).toBe('');
    });

    it('registers its key and lists itself', () => {
      expect(shortcuts.active().map((a) => a.description)).toContain('Show keyboard shortcuts');
      expect(shortcuts.active().find((a) => a.description === 'Show keyboard shortcuts')?.group).toBe('General');
    });

    it('toggles with ?', () => {
      pressShortcut('?');
      fixture.detectChanges();
      expect(dialogOf(fixture).hasAttribute('open')).toBe(true);
      expect(text(fixture)).toContain('Keyboard shortcuts');

      pressShortcut('?');
      fixture.detectChanges();
      expect(dialogOf(fixture).hasAttribute('open')).toBe(false);
      expect(text(fixture)).toBe('');
    });

    it('lists the shortcuts by group, ungrouped first', () => {
      shortcuts.register({ keys: 'escape', description: 'Close', action: jest.fn() });
      pressShortcut('?');
      fixture.detectChanges();

      const groups = [...dialogOf(fixture).querySelectorAll('h3')].map((h) => h.textContent);
      expect(groups).toEqual(['Navigation', 'Player', 'General']);
      expect(text(fixture)).toMatch(/^Keyboard shortcuts × Esc Close Navigation/);

      const rows = [...dialogOf(fixture).querySelectorAll('.ngx-shortcuts-help__row')].map(words);
      expect(rows).toEqual([
        'Esc Close',
        'Ctrl+K Search',
        'G then P Go to player',
        'Space or K Play / pause',
        '? Show keyboard shortcuts',
      ]);
      expect(dialogOf(fixture).querySelectorAll('kbd')).toHaveLength(7);
    });

    it('follows the registry while open', () => {
      pressShortcut('?');
      fixture.detectChanges();
      shortcuts.register({ keys: 'mod+s', description: 'Save', action: jest.fn() });
      fixture.detectChanges();
      expect(text(fixture)).toContain('Ctrl+S Save');
    });

    it('closes with the close button and gives focus back', () => {
      const outside = fixture.nativeElement.querySelector('#outside') as HTMLButtonElement;
      outside.focus();
      pressShortcut('?');
      fixture.detectChanges();

      (dialogOf(fixture).querySelector('.ngx-shortcuts-help__close') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(dialogOf(fixture).hasAttribute('open')).toBe(false);
      expect(document.activeElement).toBe(outside);
    });

    it('closes on Escape before an app-wide escape shortcut sees it', () => {
      const back = jest.fn();
      shortcuts.register({ keys: 'escape', description: 'Back', action: back });
      pressShortcut('?');
      fixture.detectChanges();

      pressShortcut('escape', { target: dialogOf(fixture).querySelector('button') as HTMLElement });
      fixture.detectChanges();
      expect(dialogOf(fixture).hasAttribute('open')).toBe(false);
      expect(back).not.toHaveBeenCalled();
    });

    it('closes on a backdrop click only', () => {
      const help = fixture.debugElement.children[1].componentInstance as ShortcutsHelpComponent;
      help.open();
      fixture.detectChanges();
      const dialog = dialogOf(fixture);
      jest.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ left: 100, right: 300, top: 100, bottom: 300 } as DOMRect);

      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 150, clientY: 150 }));
      fixture.detectChanges();
      expect(help.opened()).toBe(true);

      (dialog.querySelector('h2') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }));
      expect(help.opened()).toBe(true);

      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }));
      fixture.detectChanges();
      expect(help.opened()).toBe(false);
    });

    it('open() twice is harmless', () => {
      const help = fixture.debugElement.children[1].componentInstance as ShortcutsHelpComponent;
      help.open();
      help.open();
      help.close();
      expect(help.opened()).toBe(false);
    });

    it('re-registers when the key changes and unregisters with key null', () => {
      fixture.componentInstance.key = 'f1';
      fixture.detectChanges();
      expect(shortcuts.active().find((a) => a.description === 'Show keyboard shortcuts')?.keys).toEqual(['f1']);

      pressShortcut('?');
      fixture.detectChanges();
      expect(dialogOf(fixture).hasAttribute('open')).toBe(false);
      pressShortcut('f1');
      fixture.detectChanges();
      expect(dialogOf(fixture).hasAttribute('open')).toBe(true);

      fixture.componentInstance.key = null;
      fixture.detectChanges();
      expect(shortcuts.active().map((a) => a.description)).not.toContain('Show keyboard shortcuts');
    });

    it('puts focus on its heading, not on the dialog box', () => {
      pressShortcut('?');
      fixture.detectChanges();
      const heading = dialogOf(fixture).querySelector('h2') as HTMLElement;
      expect(heading.getAttribute('tabindex')).toBe('-1');
      expect(document.activeElement).toBe(heading);
    });

    it('keeps the page shortcuts from firing while open', () => {
      const search = jest.fn();
      shortcuts.register({ keys: 'k', description: 'Search', action: search });
      pressShortcut('?');
      fixture.detectChanges();

      pressShortcut('k');
      pressShortcut('mod+k');
      expect(search).not.toHaveBeenCalled();
      expect(dialogOf(fixture).hasAttribute('open')).toBe(true);

      // its own key still closes it, and the page gets its shortcuts back
      pressShortcut('?');
      fixture.detectChanges();
      expect(dialogOf(fixture).hasAttribute('open')).toBe(false);
      pressShortcut('k');
      expect(search).toHaveBeenCalledTimes(1);
    });

    it('stays exclusive when its key changes while open', () => {
      const search = jest.fn();
      shortcuts.register({ keys: 'k', description: 'Search', action: search });
      pressShortcut('?');
      fixture.componentInstance.key = 'f1';
      fixture.detectChanges();

      pressShortcut('k');
      expect(search).not.toHaveBeenCalled();
      pressShortcut('f1');
      fixture.detectChanges();
      expect(dialogOf(fixture).hasAttribute('open')).toBe(false);
      pressShortcut('k');
      expect(search).toHaveBeenCalledTimes(1);
    });

    it('blocks every shortcut while open without a key', () => {
      const search = jest.fn();
      shortcuts.register({ keys: 'k', description: 'Search', action: search });
      fixture.componentInstance.key = null;
      fixture.detectChanges();
      const help = fixture.debugElement.children[1].componentInstance as ShortcutsHelpComponent;
      help.open();

      pressShortcut('k');
      expect(search).not.toHaveBeenCalled();
      help.close();
      pressShortcut('k');
      expect(search).toHaveBeenCalledTimes(1);
    });

    it('gives the page its shortcuts back when destroyed while open', () => {
      const search = jest.fn();
      shortcuts.register({ keys: 'k', description: 'Search', action: search });
      pressShortcut('?');
      fixture.destroy();

      pressShortcut('k');
      expect(search).toHaveBeenCalledTimes(1);
    });

    it('unregisters its key when destroyed', () => {
      fixture.destroy();
      expect(shortcuts.active().map((a) => a.description)).not.toContain('Show keyboard shortcuts');
    });

    it('labels the dialog with its heading', () => {
      fixture.componentInstance.heading = 'Keys';
      pressShortcut('?');
      fixture.detectChanges();
      const dialog = dialogOf(fixture);
      const title = dialog.querySelector('h2') as HTMLElement;
      expect(title.textContent).toBe('Keys');
      expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    });
  });

  describe('with a native dialog', () => {
    let showModal: jest.Mock;
    let close: jest.Mock;

    beforeEach(() => {
      showModal = jest.fn(function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      });
      close = jest.fn(function (this: HTMLDialogElement) {
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
      });
      Object.assign(HTMLDialogElement.prototype, { showModal, close });
      create('mac');
    });

    afterEach(() => {
      delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
      delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
    });

    it('opens modally and closes through the close event', () => {
      pressShortcut('?');
      fixture.detectChanges();
      expect(showModal).toHaveBeenCalledTimes(1);
      expect(text(fixture)).toContain('⌘K Search');

      pressShortcut('?');
      fixture.detectChanges();
      expect(close).toHaveBeenCalledTimes(1);
      expect(text(fixture)).toBe('');
    });
  });

  it('shows an empty state', () => {
    TestBed.configureTestingModule({});
    const help = TestBed.createComponent(ShortcutsHelpComponent);
    help.componentInstance.key = null;
    help.detectChanges();
    help.componentInstance.open();
    help.detectChanges();
    expect(help.nativeElement.textContent).toContain('No shortcuts available.');
  });

  it('renders on the server without opening', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const help = TestBed.createComponent(ShortcutsHelpComponent);
    help.detectChanges();
    expect(help.nativeElement.querySelector('dialog').hasAttribute('open')).toBe(false);
    expect(TestBed.inject(Shortcuts).active()).toHaveLength(1);
  });
});

describe('ShortcutsModule', () => {
  @Component({
    selector: 'app-root',
    template: '<span>{{ \'mod+k\' | shortcutKeys }}</span><ngx-shortcuts-help />',
  })
  class AppComponent {}

  @NgModule({
    declarations: [AppComponent],
    imports: [ShortcutsModule.forRoot({ platform: 'mac' })],
  })
  class AppModule {}

  it('provides the config and exports the pipe and the help overlay', () => {
    TestBed.configureTestingModule({ imports: [AppModule] });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('span').textContent).toBe('⌘K');
    expect(fixture.nativeElement.querySelector('ngx-shortcuts-help dialog')).not.toBeNull();
    expect(TestBed.inject(Shortcuts).platform).toBe('mac');
  });

  it('works without forRoot', () => {
    @Component({ selector: 'app-feature', template: '<span>{{ \'mod+k\' | shortcutKeys }}</span>' })
    class FeatureComponent {}

    @NgModule({ declarations: [FeatureComponent], imports: [ShortcutsModule] })
    class FeatureModule {}

    TestBed.configureTestingModule({ imports: [FeatureModule] });
    const fixture = TestBed.createComponent(FeatureComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span').textContent).toMatch(/^(⌘K|Ctrl\+K)$/);
  });
});

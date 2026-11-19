import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { formatShortcutChords } from './binding';
import { Shortcuts, ShortcutsRegistration } from './shortcuts';

interface HelpRow {
  readonly description: string;
  /** one entry per binding, each a list of formatted chords */
  readonly keys: readonly (readonly string[])[];
}

interface HelpGroup {
  readonly name: string;
  readonly rows: readonly HelpRow[];
}

let nextId = 0;

/**
 * A help overlay listing the active shortcuts, on a native modal `<dialog>`.
 *
 * Put `<ngx-shortcuts-help />` once in the app shell: `?` toggles it (change it
 * with `key`, or bind `[key]="null"` and call `open()` yourself).
 * Style it with the `--ngx-shortcuts-help-*` custom properties.
 */
@Component({
  selector: 'ngx-shortcuts-help',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialog
      class="ngx-shortcuts-help"
      [attr.aria-labelledby]="titleId"
      (keydown.escape)="onEscape($event)"
      (close)="onClosed()"
      (click)="onDialogClick($event)"
    >
      @if (opened()) {
        <header class="ngx-shortcuts-help__header">
          <h2 class="ngx-shortcuts-help__title" [id]="titleId">{{ heading }}</h2>
          <button type="button" class="ngx-shortcuts-help__close" aria-label="Close" (click)="close()">&times;</button>
        </header>
        @for (group of groups(); track group.name) {
          <section class="ngx-shortcuts-help__group">
            @if (group.name) {
              <h3 class="ngx-shortcuts-help__group-title">{{ group.name }}</h3>
            }
            <dl class="ngx-shortcuts-help__list">
              @for (row of group.rows; track $index) {
                <div class="ngx-shortcuts-help__row">
                  <dt class="ngx-shortcuts-help__keys">
                    @for (binding of row.keys; track $index; let firstBinding = $first) {
                      @if (!firstBinding) {
                        <span class="ngx-shortcuts-help__sep">or</span>
                      }
                      @for (chord of binding; track $index; let firstChord = $first) {
                        @if (!firstChord) {
                          <span class="ngx-shortcuts-help__sep">then</span>
                        }
                        <kbd>{{ chord }}</kbd>
                      }
                    }
                  </dt>
                  <dd class="ngx-shortcuts-help__description">{{ row.description }}</dd>
                </div>
              }
            </dl>
          </section>
        } @empty {
          <p class="ngx-shortcuts-help__empty">No shortcuts available.</p>
        }
      }
    </dialog>
  `,
  styles: [`
    :host { display: contents; }

    .ngx-shortcuts-help {
      box-sizing: border-box;
      width: min(var(--ngx-shortcuts-help-width, 36rem), calc(100vw - 2rem));
      max-height: min(80vh, 48rem);
      overflow: auto;
      padding: var(--ngx-shortcuts-help-padding, 1.25rem 1.5rem);
      border: 1px solid var(--ngx-shortcuts-help-border, color-mix(in srgb, CanvasText 15%, transparent));
      border-radius: var(--ngx-shortcuts-help-radius, 0.75rem);
      background: var(--ngx-shortcuts-help-bg, Canvas);
      color: var(--ngx-shortcuts-help-fg, CanvasText);
      font: var(--ngx-shortcuts-help-font, inherit);
      box-shadow: var(--ngx-shortcuts-help-shadow, 0 1rem 3rem rgb(0 0 0 / 0.25));
    }

    .ngx-shortcuts-help::backdrop {
      background: var(--ngx-shortcuts-help-backdrop, rgb(0 0 0 / 0.4));
    }

    .ngx-shortcuts-help__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .ngx-shortcuts-help__title {
      margin: 0;
      font-size: 1.125rem;
    }

    .ngx-shortcuts-help__close {
      border: 0;
      background: none;
      color: inherit;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    .ngx-shortcuts-help__close:focus-visible {
      outline: 2px solid var(--ngx-shortcuts-help-accent, Highlight);
    }

    .ngx-shortcuts-help__group + .ngx-shortcuts-help__group {
      margin-top: 1rem;
    }

    .ngx-shortcuts-help__group-title {
      margin: 0 0 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ngx-shortcuts-help-muted, color-mix(in srgb, CanvasText 65%, transparent));
    }

    .ngx-shortcuts-help__list {
      margin: 0;
    }

    .ngx-shortcuts-help__row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.375rem 0;
      border-bottom: 1px solid var(--ngx-shortcuts-help-divider, color-mix(in srgb, CanvasText 8%, transparent));
    }

    .ngx-shortcuts-help__keys {
      order: 2;
      flex-shrink: 0;
      white-space: nowrap;
    }

    .ngx-shortcuts-help__description {
      margin: 0;
    }

    .ngx-shortcuts-help__sep {
      margin: 0 0.25rem;
      font-size: 0.75rem;
      color: var(--ngx-shortcuts-help-muted, color-mix(in srgb, CanvasText 65%, transparent));
    }

    kbd {
      display: inline-block;
      min-width: 1.5em;
      padding: 0.125rem 0.375rem;
      border: 1px solid var(--ngx-shortcuts-help-kbd-border, color-mix(in srgb, CanvasText 25%, transparent));
      border-bottom-width: 2px;
      border-radius: 0.25rem;
      background: var(--ngx-shortcuts-help-kbd-bg, color-mix(in srgb, CanvasText 6%, Canvas));
      color: var(--ngx-shortcuts-help-kbd-fg, inherit);
      font: var(--ngx-shortcuts-help-kbd-font, 0.8125rem ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
      text-align: center;
    }
  `],
})
export class ShortcutsHelpComponent implements OnInit, OnChanges {
  /** binding that toggles the overlay; `null` to open it only through `open()` */
  @Input() key: string | null = '?';
  // not `title`: a static `title` attribute would also land on the host and show as a tooltip
  @Input() heading = 'Keyboard shortcuts';
  /** group the overlay's own shortcut is listed under */
  @Input() group?: string;

  @ViewChild('dialog', { static: true }) private dialog!: ElementRef<HTMLDialogElement>;

  readonly titleId = `ngx-shortcuts-help-title-${nextId++}`;

  private readonly shortcuts = inject(Shortcuts);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  private readonly _opened = signal(false);
  readonly opened = this._opened.asReadonly();

  readonly groups = computed<HelpGroup[]>(() => {
    const groups = new Map<string, HelpRow[]>();
    for (const item of this.shortcuts.active()) {
      const name = item.group ?? '';
      const rows = groups.get(name) ?? [];
      rows.push({
        description: item.description,
        keys: item.keys.map((binding) => formatShortcutChords(binding, this.shortcuts.platform)),
      });
      groups.set(name, rows);
    }
    // ungrouped shortcuts first, then groups in the order they were first registered
    return [...groups].map(([name, rows]) => ({ name, rows })).sort((a, b) => Number(!!a.name) - Number(!!b.name));
  });

  private registration?: ShortcutsRegistration;
  private initialized = false;
  private returnFocus: HTMLElement | null = null;

  ngOnInit(): void {
    this.initialized = true;
    this.registerKey();
  }

  ngOnChanges(): void {
    if (this.initialized) {
      this.registerKey();
    }
  }

  open(): void {
    const dialog = this.dialog.nativeElement;
    if (this._opened()) {
      return;
    }
    this.returnFocus = this.document.activeElement as HTMLElement | null;
    this._opened.set(true);
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  close(): void {
    const dialog = this.dialog.nativeElement;
    if (typeof dialog.close === 'function') {
      // fires (close), which runs onClosed()
      dialog.close();
    } else {
      dialog.removeAttribute('open');
      this.onClosed();
    }
  }

  toggle(): void {
    if (this._opened()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected onClosed(): void {
    if (!this._opened()) {
      return;
    }
    this._opened.set(false);
    this.returnFocus?.focus?.();
    this.returnFocus = null;
  }

  protected onEscape(event: Event): void {
    // handled here so an app-wide `escape` shortcut does not swallow it first
    event.preventDefault();
    this.close();
  }

  protected onDialogClick(event: MouseEvent): void {
    // the backdrop belongs to the dialog element: a click on it lands outside the dialog box
    const dialog = this.dialog.nativeElement;
    const box = dialog.getBoundingClientRect();
    const inside = event.clientX >= box.left && event.clientX <= box.right
      && event.clientY >= box.top && event.clientY <= box.bottom;
    if (event.target === dialog && !inside) {
      this.close();
    }
  }

  private registerKey(): void {
    this.registration?.unregister();
    this.registration = undefined;
    if (this.key) {
      this.registration = this.shortcuts.register({
        keys: this.key,
        description: 'Show keyboard shortcuts',
        group: this.group,
        action: () => this.toggle(),
      }, this.destroyRef);
    }
  }
}

import { inject, Pipe, PipeTransform } from '@angular/core';

import { formatShortcut } from './binding';
import { Shortcuts } from './shortcuts';

/**
 * Renders bindings for the current platform: `'mod+k' | shortcutKeys` is `⌘K`
 * on a Mac and `Ctrl+K` elsewhere, `'g p'` is `G then P`. Several bindings are
 * joined with ` / `.
 */
@Pipe({ name: 'shortcutKeys', standalone: true })
export class ShortcutKeysPipe implements PipeTransform {
  private readonly platform = inject(Shortcuts).platform;

  transform(keys: string | readonly string[] | null | undefined): string {
    if (keys == null) {
      return '';
    }
    const list = typeof keys === 'string' ? [keys] : keys;
    return list.map((binding) => formatShortcut(binding, this.platform)).join(' / ');
  }
}

import { InjectionToken } from '@angular/core';

import { ShortcutsPlatform } from './binding';

export interface ShortcutsConfig {
  /**
   * Which platform `mod` resolves for and how bindings are displayed.
   * Detected from `navigator` when omitted; `other` on the server.
   */
  platform?: ShortcutsPlatform;
  /** milliseconds allowed between the keys of a sequence such as `g p`; default 1000 */
  sequenceTimeout?: number;
  /** warn in dev mode when a binding is one the browser reserves (Ctrl/⌘+T...); default true */
  warnOnReserved?: boolean;
}

export const SHORTCUTS_CONFIG = new InjectionToken<ShortcutsConfig>('SHORTCUTS_CONFIG');

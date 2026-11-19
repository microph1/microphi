export {
  canonicalShortcut,
  detectPlatform,
  formatShortcut,
  formatShortcutChords,
  isReservedChord,
  matchesChord,
  normalizeKey,
  parseShortcut,
} from './lib/binding';
export type { ShortcutChord, ShortcutsPlatform } from './lib/binding';
export { SHORTCUTS_CONFIG } from './lib/config';
export type { ShortcutsConfig } from './lib/config';
export { ShortcutsError } from './lib/errors';
export type { ShortcutsErrorCode } from './lib/errors';
export { provideShortcuts, ShortcutsModule } from './lib/providers';
export { ShortcutKeysPipe } from './lib/shortcut-keys.pipe';
export { ShortcutsHelpComponent } from './lib/shortcuts-help.component';
export { registerShortcuts, Shortcuts } from './lib/shortcuts';
export type { ActiveShortcut, Shortcut, ShortcutsRegistration } from './lib/shortcuts';

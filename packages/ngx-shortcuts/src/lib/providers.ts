import { EnvironmentProviders, makeEnvironmentProviders, ModuleWithProviders, NgModule } from '@angular/core';

import { SHORTCUTS_CONFIG, ShortcutsConfig } from './config';
import { ShortcutKeysPipe } from './shortcut-keys.pipe';
import { ShortcutsHelpComponent } from './shortcuts-help.component';

/**
 * Configures shortcuts for a standalone app (`bootstrapApplication(App, { providers: [provideShortcuts()] })`).
 * Optional: `Shortcuts` works with the defaults without it.
 */
export function provideShortcuts(config: ShortcutsConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: SHORTCUTS_CONFIG, useValue: config }]);
}

/**
 * NgModule flavour: import `ShortcutsModule.forRoot(config)` once in the root
 * module, plain `ShortcutsModule` wherever the pipe or the help overlay is used.
 */
@NgModule({
  imports: [ShortcutKeysPipe, ShortcutsHelpComponent],
  exports: [ShortcutKeysPipe, ShortcutsHelpComponent],
})
export class ShortcutsModule {
  static forRoot(config: ShortcutsConfig = {}): ModuleWithProviders<ShortcutsModule> {
    return {
      ngModule: ShortcutsModule,
      providers: [{ provide: SHORTCUTS_CONFIG, useValue: config }],
    };
  }
}

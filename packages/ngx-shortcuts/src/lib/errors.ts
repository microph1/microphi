const DOCS = 'https://github.com/microph1/microphi/blob/master/packages/ngx-shortcuts/ERRORS.md';

/** see ERRORS.md for what each code means and how to fix it */
export type ShortcutsErrorCode = 'SHORTCUTS001' | 'SHORTCUTS002' | 'SHORTCUTS003';

/**
 * Errors thrown by @microphi/ngx-shortcuts. The message starts with the code
 * and ends with a link to its entry in ERRORS.md.
 */
export class ShortcutsError extends Error {
  override readonly name = 'ShortcutsError';

  constructor(readonly code: ShortcutsErrorCode, message: string) {
    super(`${code}: ${message}\nSee ${DOCS}#${code.toLowerCase()}`);
  }
}

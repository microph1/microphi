const DOCS = 'https://github.com/microph1/microphi/blob/master/packages/list/ERRORS.md';

/** see ERRORS.md for what each code means and how to fix it */
export type ListErrorCode = 'LIST001' | 'LIST002';

/**
 * Errors thrown by @microphi/list. The message starts with the code and ends
 * with a link to its entry in ERRORS.md.
 */
export class ListError extends Error {
  override readonly name = 'ListError';

  constructor(readonly code: ListErrorCode, message: string) {
    super(`${code}: ${message}\nSee ${DOCS}#${code.toLowerCase()}`);
  }
}

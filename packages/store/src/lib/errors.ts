const DOCS = 'https://github.com/microph1/microphi/blob/master/packages/store/ERRORS.md';

/** see ERRORS.md for what each code means and how to fix it */
export type StoreErrorCode = 'STORE001' | 'STORE002' | 'STORE003' | 'STORE004';

/**
 * Errors thrown by @microphi/store. The message starts with the code and ends
 * with a link to its entry in ERRORS.md.
 */
export class StoreError extends Error {
  override readonly name = 'StoreError';

  constructor(readonly code: StoreErrorCode, message: string) {
    super(`${code}: ${message}\nSee ${DOCS}#${code.toLowerCase()}`);
  }
}

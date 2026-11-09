const DOCS = 'https://github.com/microph1/microphi/blob/master/packages/flux/ERRORS.md';

/** see ERRORS.md for what each code means and how to fix it */
export type FluxErrorCode = 'FLUX001' | 'FLUX002';

/**
 * Errors thrown by @microphi/flux. The message starts with the code and ends
 * with a link to its entry in ERRORS.md.
 */
export class FluxError extends Error {
  override readonly name = 'FluxError';

  constructor(readonly code: FluxErrorCode, message: string) {
    super(`${code}: ${message}\nSee ${DOCS}#${code.toLowerCase()}`);
  }
}

const STATUS_PREFIX = /^\[(\d{3})\]\s*([\s\S]*)$/;

/**
 * An error carrying the HTTP status to respond with.
 *
 * The message keeps the `[status] message` form on purpose: API Gateway's
 * `lambda` integration maps errors to responses by matching that prefix
 * (`selectionPattern: '^\[404\].*'`), and older code throws plain errors in
 * the same form; `HttpError.from` reads both.
 */
export class HttpError extends Error {
  override readonly name = 'HttpError';

  constructor(
    readonly status: number,
    message: string,
    /** machine readable context, e.g. validation issues */
    readonly details?: unknown,
    options?: ErrorOptions,
  ) {
    super(`[${status}] ${message}`, options);
  }

  /** the message without the `[status]` prefix */
  get reason(): string {
    return this.message.replace(STATUS_PREFIX, '$2');
  }

  /**
   * Normalize anything thrown into an `HttpError`: an `HttpError` is returned
   * as is, an error whose message starts with `[nnn]` keeps that status,
   * anything else becomes a 500.
   */
  static from(e: unknown): HttpError {
    if (e instanceof HttpError) {
      return e;
    }

    const message = e instanceof Error ? e.message : String(e);
    const match = message.match(STATUS_PREFIX);

    if (match) {
      return new HttpError(Number(match[1]), match[2], undefined, { cause: e });
    }

    return new HttpError(500, message, undefined, { cause: e });
  }
}

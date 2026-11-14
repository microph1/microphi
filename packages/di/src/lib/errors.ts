import { Klass } from './types';
import { getProviderName } from './injctable/provider-token';

const DOCS = 'https://github.com/microph1/microphi/blob/master/packages/di/ERRORS.md';

/** see ERRORS.md for what each code means and how to fix it */
export type DiErrorCode =
  /** the class is not decorated with @Injectable() */
  | 'DI001'
  /** the class is @Injectable() but nothing provides it */
  | 'DI002'
  /** two classes @Inject each other, directly or through others */
  | 'DI003'
  /** a provider resolved to no class */
  | 'DI004';

/**
 * Errors thrown by the container. The message starts with the code and ends
 * with a link to its entry in ERRORS.md.
 */
export class DiError extends Error {
  override readonly name = 'DiError';

  constructor(readonly code: DiErrorCode, message: string) {
    super(`${code}: ${message}\nSee ${DOCS}#${code.toLowerCase()}`);
  }
}

/**
 * the name a class was declared with: @Injectable() returns a subclass whose own
 * name is empty, or a temp name such as `_b` once a bundler lowers it, so name
 * the class it was decorated from
 */
export function className(klass: Klass): string {
  return getProviderName(klass) || klass.name || Object.getPrototypeOf(klass)?.name || String(klass);
}

import { Klass } from '../types';

interface ProviderEntry {
  /** the class that was decorated: providers, instances and `useClass` are keyed by it */
  token: Klass;
  /** the name it was declared with, for messages */
  name: string;
}

/**
 * Keyed by identity, so classes sharing a name (bundlers rename them to `_b`
 * and the like) never collide.
 */
const entries = new WeakMap<Klass, ProviderEntry>();

export function setProviderToken(klass: Klass, token: Klass, name: string): void {
  entries.set(klass, { token, name });
}

/**
 * The entry `klass` is provided under, or `undefined` if it is not @Injectable().
 * Walks the prototype chain, so a subclass of an injectable resolves to its parent
 * unless it was decorated itself.
 */
function getProviderEntry(klass: Klass): ProviderEntry | undefined {
  for (let k: unknown = klass; typeof k === 'function'; k = Object.getPrototypeOf(k)) {
    const entry = entries.get(k as Klass);
    if (entry) {
      return entry;
    }
  }

  return undefined;
}

export function getProviderToken(klass: Klass): Klass | undefined {
  return getProviderEntry(klass)?.token;
}

export function getProviderName(klass: Klass): string | undefined {
  return getProviderEntry(klass)?.name;
}

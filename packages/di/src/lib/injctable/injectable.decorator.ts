import 'reflect-metadata';
import { injector } from './injector';
import { getInjectMetadata } from './inject.decorator';
import { Klass } from '../types';
import { className } from '../errors';
import { getProviderName, setProviderToken } from './provider-token';

/**
 * Static set on every @Injectable() class, holding the name it was declared with.
 * @deprecated providers are keyed by class identity, not by this name; use
 * `className()` for a readable name. Kept so `ClassNameSymbol in klass` still
 * tells an @Injectable() class apart.
 */
export const ClassNameSymbol = Symbol('ClassName');

/**
 * Annotate a Class to be part of the DI system
 * @constructor
 */
export function Injectable() {
  return target => {
    return InjectableDecorator(target);
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function InjectableDecorator<T extends {new(...args: any[]): {}}>(klass: T) {
  // decorating the subclass returned by an earlier decoration: its own name is empty
  const name = klass.name || className(klass);
  const injectMetadata = getInjectMetadata(klass);

  const decorated = class extends klass {
    constructor(...args: any[]) {

      for (const {parameterIndex, klass} of injectMetadata) {
        // TODO implement a factory
        // factory should be configurable from the @DI container so that
        // dependencies can be passed
        args[parameterIndex] = injector(klass);
      }

      super(...args);
    }
  };

  // assigned rather than declared as a static field: bundlers lower static
  // fields into `_b = class extends ...`, which names the class `_b`
  (decorated as unknown as Record<symbol, string>)[ClassNameSymbol] = name;

  // the undecorated class resolves to the same provider as the returned one:
  // member decorators only ever see the original class (e.g. `target.constructor`)
  setProviderToken(klass, klass, name);
  setProviderToken(decorated, klass, name);

  return decorated;
}

/**
 * The name `klass` was declared with, if it is @Injectable().
 * @deprecated providers are keyed by class identity; use `className()`.
 */
export function getInjectableMetadata(klass: Klass): string {
  return getProviderName(klass) as string;
}

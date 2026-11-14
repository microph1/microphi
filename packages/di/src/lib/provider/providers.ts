import { getProviderToken } from '../injctable/provider-token';
import { className, DiError } from '../errors';
import { Instance, isSingletonDefinition, Klass, Provider } from '../types';


/**
 * Every map is keyed by provider token: the class @Injectable() decorated, which
 * the decorated subclass and the original class both resolve to.
 */
export class Providers {
  private providers: Map<Klass, Klass> = new Map();
  private useClass: Map<Klass, Klass> = new Map();
  private instances: Map<Klass, Instance> = new Map();
  /** the tokens being instantiated, outermost first */
  private resolving: Klass[] = [];


  addInjectable(provider: Provider): void {

    if (isSingletonDefinition(provider)) {
      const token = getProviderToken(provider.provide);
      if (!token) {
        throw new DiError('DI001', `${className(provider.provide)} is not decorated with @Injectable(); decorate it before providing it.`);
      }

      this.providers.set(token, provider.provide);
      this.useClass.set(token, provider.useClass);

    } else {
      const token = getProviderToken(provider);
      if (!token) {
        throw new DiError('DI001', `${className(provider)} is not decorated with @Injectable(); decorate it before providing it.`);
      }

      this.providers.set(token, provider);
    }
  }

  hasInjectable(klass: Klass) {
    const token = getProviderToken(klass);

    return !!token && this.providers.has(token);
  }

  hasInstance(klass: Klass) {
    const token = getProviderToken(klass);

    return !!token && this.instances.has(token);
  }

  getInstance(klass: Klass) {
    const token = getProviderToken(klass);
    if (token && this.instances.has(token)) {
      return this.instances.get(token);
    }

    const k = token && (this.useClass.has(token) ? this.useClass.get(token) : this.providers.get(token));
    if (!token || !k) {
      throw new DiError('DI004', `Unable to instantiate ${className(klass)}: its provider resolved to no class.`);
    }

    // a cycle cannot be caught when the classes are declared: writing one makes
    // `@Inject(B)` read B before it is defined (a TDZ ReferenceError, or
    // `undefined` across an import cycle); it only closes through providers,
    // e.g. `{ provide: A, useClass: AImpl }` where AImpl injects B and B injects A
    const start = this.resolving.indexOf(token);
    if (start !== -1) {
      const path = [...this.resolving.slice(start), token].map((t) => className(t)).join(' -> ');
      throw new DiError('DI003', `Cyclic dependency: ${path}. Break the cycle, e.g. by moving the shared logic into a third service.`);
    }

    this.resolving.push(token);
    try {
      const instance = new k();
      this.instances.set(token, instance);
      return instance;
    } finally {
      this.resolving.pop();
    }
  }

  hasUseClass(klass: Klass) {
    const token = getProviderToken(klass);

    return !!token && this.useClass.has(token);
  }

  getUseClass(klass: Klass) {
    const token = getProviderToken(klass);

    return token && this.useClass.get(token);
  }

  reset() {
    this.providers.clear();
    this.useClass.clear();
    this.instances.clear();
    this.resolving = [];
  }
}

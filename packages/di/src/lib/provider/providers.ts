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

    const instance = new k();
    this.instances.set(token, instance);
    return instance;
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
  }
}

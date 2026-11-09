import { ClassNameSymbol, getInjectableMetadata, } from '../injctable/injectable.decorator';
import { className, DiError } from '../errors';
import { Instance, isSingletonDefinition, Klass, Provider } from '../types';


export class Providers {
  private providers: Map<unknown, Klass> = new Map();
  private useClass: Map<unknown, Klass> = new Map();
  private instances: Map<unknown, Instance> = new Map();


  addInjectable(provider: Provider): void {

    if (isSingletonDefinition(provider)) {
      if (!(ClassNameSymbol in provider.provide)) {
        throw new DiError('DI001', `${className(provider.provide)} is not decorated with @Injectable(); decorate it before providing it.`);
      }

      this.providers.set(provider.provide[ClassNameSymbol], provider.provide);
      this.useClass.set(provider.provide[ClassNameSymbol], provider.useClass);

    } else {
      if (!(ClassNameSymbol in provider)) {
        throw new DiError('DI001', `${className(provider)} is not decorated with @Injectable(); decorate it before providing it.`);
      }

      this.providers.set(provider[ClassNameSymbol], provider);
    }
  }

  hasInjectable(klass: Klass) {
    const name = Providers.getName(klass);

    return this.providers.has(name);
  }

  hasInstance(klass: Klass) {
    return this.instances.has(Providers.getName(klass));
  }

  getInstance(klass: Klass) {
    // TODO optimization needed
    const name = Providers.getName(klass);
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }

    if (this.useClass.has(name)) {
      const k = this.useClass.get(name);
      if (!k) {
        throw new DiError('DI004', `Unable to instantiate ${className(klass)}: its provider resolved to no class.`);
      }
      const instance = new k();
      this.instances.set(name, instance);
      return instance;
    }

    const k = this.providers.get(name);
    if (!k) {
      throw new DiError('DI004', `Unable to instantiate ${className(klass)}: its provider resolved to no class.`);
    }
    const instance = new k();
    this.instances.set(name, instance);
    return instance;

  }

  hasUseClass(klass: Klass) {
    return this.useClass.has(Providers.getName(klass));
  }

  getUseClass(klass: Klass) {
    return this.useClass.get(Providers.getName(klass));
  }

  private static getName(klass: Klass) {
    return ClassNameSymbol in klass ? klass[ClassNameSymbol] : getInjectableMetadata(klass);
  }

  reset() {
    this.providers.clear();
    this.useClass.clear();
    this.instances.clear();
  }
}

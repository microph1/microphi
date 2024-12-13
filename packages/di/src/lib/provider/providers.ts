import { ClassNameSymbol, getInjectableMetadata, } from '../injctable/injectable.decorator';
import { Instance, isSingletonDefinition, Klass, Provider } from '../types';


export class Providers {
  private providers: Map<unknown, Klass> = new Map();
  private useClass: Map<unknown, Klass> = new Map();
  private instances: Map<unknown, Instance> = new Map();


  addInjectable(provider: Provider): void {

    if (isSingletonDefinition(provider)) {
      if (!(ClassNameSymbol in provider.provide)) {
        throw Error(`Is ${provider.provide.name} annotated with @Injectable()?`);
      }

      this.providers.set(provider.provide[ClassNameSymbol], provider.provide);
      this.useClass.set(provider.provide[ClassNameSymbol], provider.useClass);

    } else {
      if (!(ClassNameSymbol in provider)) {
        throw Error(`Is ${provider.name} annotated with @Injectable()?`);
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
    const className = Providers.getName(klass);
    if (this.instances.has(className)) {
      return this.instances.get(className);
    }

    if (this.useClass.has(className)) {
      const k = this.useClass.get(className);
      if (!k) {
        throw new Error('Unable to instantiat class');
      }
      const instance = new k();
      this.instances.set(className, instance);
      return instance;
    }

    const k = this.providers.get(className);
    if (!k) {
      throw new Error('Unable to instantiat class');
    }
    const instance = new k();
    this.instances.set(className, instance);
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

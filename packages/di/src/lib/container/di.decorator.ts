import { Klass, Provider } from '../types';
import { Providers } from '../provider/providers';
import { ClassNameSymbol, InjectableDecorator } from '../injctable/injectable.decorator';

export const providers = new Providers();

export interface DIOptions {
  providers: Provider[];
}

export const DISymbol = Symbol('@DI');

export function DI(options: DIOptions) {
  return (target) => {
    target[ClassNameSymbol] = 'root';
    Reflect.metadata(DISymbol, options)(target);
    return InjectableDecorator(target);
  }
}

export function getDIMetadata(target: Klass): DIOptions {
  return Reflect.getMetadata(DISymbol, target);
}


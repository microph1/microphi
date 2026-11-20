import { Klass } from '../types';


const InjectSymbol = Symbol.for('@Inject');

export function Inject<K extends Klass<unknown>>(klass: K): ParameterDecorator {

  return (target, propertyKey, parameterIndex) => {

    const deps = getInjectMetadata(target);
    deps.push({
      parameterIndex,
      klass
    });

    return Reflect.metadata(InjectSymbol, deps)(target as any);
  };
}

export function getInjectMetadata(target: any): {parameterIndex: number, klass: Klass<unknown>}[] {
  return Reflect.getMetadata(InjectSymbol, target) || [];
}

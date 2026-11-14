import { Class } from 'utility-types';


const InjectSymbol = Symbol.for('@Inject');

export function Inject<K extends Class<unknown>>(klass: K): ParameterDecorator {

  return (target, propertyKey, parameterIndex) => {

    const deps = getInjectMetadata(target);
    deps.push({
      parameterIndex,
      klass
    });

    return Reflect.metadata(InjectSymbol, deps)(target as any);
  };
}

export function getInjectMetadata(target: any): {parameterIndex: number, klass: Class<unknown>}[] {
  return Reflect.getMetadata(InjectSymbol, target) || [];
}

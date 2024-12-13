import { Graph } from '../container/graph';
import { Class } from 'utility-types';
import { ClassNameSymbol } from './injectable.decorator';


const dependencies = new Graph();

const InjectSymbol = Symbol.for('@Inject');

export function Inject<K extends Class<unknown>>(klass: K): ParameterDecorator {

  return (target, propertyKey, parameterIndex) => {

    const targetClassName = target['name'];

    const originalClassName = klass[ClassNameSymbol];

    dependencies.addEdge(originalClassName, targetClassName);

    if (dependencies.hasCycle()) {
      console.error(dependencies.serialize());
      throw new Error(`Cycle dependency found ${originalClassName}`);
    }

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

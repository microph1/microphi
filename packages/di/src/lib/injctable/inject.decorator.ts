import { className, DiError } from '../errors';
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
      throw new DiError('DI003', `Cyclic dependency: ${targetClassName} and ${className(klass)} depend on each other, directly or through other classes. Break the cycle, e.g. by moving the shared logic into a third service.`);
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

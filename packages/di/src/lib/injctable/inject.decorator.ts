import { Graph } from '../container/graph';
import { Class } from 'utility-types';
import { getDebugger } from '@microphi/debug';
import { ClassNameSymbol } from './injectable.decorator';

const d = getDebugger('microphi:di:inject.decorator');

const dependencies = new Graph();

const InjectSymbol = Symbol.for('@Inject');

export function Inject<K extends Class<unknown>>(klass: K): ParameterDecorator {

  return (target, propertyKey, parameterIndex) => {

    const targetClassName = target['name'];

    d('class', targetClassName, 'depends on', klass[ClassNameSymbol]);

    const originalClassName = klass[ClassNameSymbol];

    dependencies.addEdge(originalClassName, targetClassName);


    d('are there cycles?', dependencies.hasCycle());

    if (dependencies.hasCycle()) {
      console.error(dependencies.serialize());
      throw new Error(`Cycle dependency found ${originalClassName}`);
    }

    d('dependencies', dependencies.serialize());

    const deps = getInjectMetadata(target);
    deps.push({
      parameterIndex,
      klass
    });
    d('defined deps', deps);

    return Reflect.metadata(InjectSymbol, deps)(target as any);
  };
}

export function getInjectMetadata(target: any): {parameterIndex: number, klass: Class<unknown>}[] {
  return Reflect.getMetadata(InjectSymbol, target) || [];
}

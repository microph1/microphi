import 'reflect-metadata';
import { getDebugger } from '@microphi/debug';
import { injector } from './injector';
import { getInjectMetadata } from './inject.decorator';
import { Klass } from '../types';

const d = getDebugger('microphi:di:injectable.decorator');


export const ClassNameSymbol = Symbol('ClassName');

/**
 * Annotate a Class to be part of the DI system
 * @constructor
 */
export function Injectable() {
  return target => {
    d('annotating', target.name);
    return InjectableDecorator(target);
  };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function InjectableDecorator<T extends {new(...args: any[]): {}}>(klass: T) {
  // this is needed because minified code can have different classes with the same name
  // leading to a dependency cycle error which is not really there
  // appending a random number will fix this problem
  // TODO ideally this should be collision free hashing
  const suffix = (Math.random() * 10_000).toFixed(0).toString();

  Reflect.metadata(ClassNameSymbol, klass)(klass);
  const injectMetadata = getInjectMetadata(klass);

  return class extends klass {
    static [ClassNameSymbol] = `${klass.name}_${suffix}`;

    static {
      d('this is the static portion of', klass.name + suffix);
      d('here symbol has been set');
    }

    constructor(...args: any[]) {
      d(args);
      d({ injectMetadata });

      for (const {parameterIndex, klass} of injectMetadata) {
        // TODO implement a factory
        // factory should be configurable from the @DI container so that
        // dependencies can be passed
        args[parameterIndex] = injector(klass);
      }

      super(...args);

      // d('class name', this[ClassNameSymbol]);

    }
  };
}

export function getInjectableMetadata(klass: Klass): string {
  return Reflect.getMetadata(ClassNameSymbol, klass);
}

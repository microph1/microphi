import { getDebugger } from '@microphi/debug';
import { Injectable } from '@microphi/di';
import { ComponentOptions } from './component.decorator';

const d = getDebugger('@flux:core:@Directive');

const DirectiveSymbol = Symbol('@Decorator');

const directives = {};

export function Directive_(options: ComponentOptions): ClassDecorator {

  d('options', options);

  return (target) => {
    Reflect.defineMetadata(DirectiveSymbol, options, target);
    // @ts-ignore
    directives[options.selector] = target;
    d('decorated', target);
    d('directives available', directives);

    const klass = Injectable()(target);

    return klass;
  };
}

export function getDirectives() {
  return directives;
}

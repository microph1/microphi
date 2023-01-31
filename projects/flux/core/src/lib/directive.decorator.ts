import { getDebugger } from '@microgamma/loggator';
import { Injectable } from '@microgamma/digator';
import { ComponentOptions } from './component.decorator';

const d = getDebugger('@flux:core:@Directive');

const DirectiveSymbol = Symbol('@Decorator');

const directives = {}

export function Directive_(options: ComponentOptions) {

  d('options', options);

  return (target) => {
    Reflect.defineMetadata(DirectiveSymbol, options, target);
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

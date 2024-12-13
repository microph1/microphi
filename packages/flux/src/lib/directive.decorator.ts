import { Injectable } from '@microphi/di';
import { ComponentOptions } from './component.decorator';


const DirectiveSymbol = Symbol('@Decorator');

const directives = {};

export function Directive_(options: ComponentOptions): ClassDecorator {


  return (target) => {
    Reflect.defineMetadata(DirectiveSymbol, options, target);
    // @ts-ignore
    directives[options.selector] = target;

    const klass = Injectable()(target);

    return klass;
  };
}

export function getDirectives() {
  return directives;
}

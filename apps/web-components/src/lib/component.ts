import { getDebugger } from '@microgamma/loggator';
import { getInputMetadata } from './input';

const d = getDebugger('web-components:component-decorator');

const ComponentSymbol = Symbol('@Component');

export interface Options {
  selector: string;
  template?: string;
  templateUrl?: string;
  inputs?: string[];
  templateHtml?: (comp: any) => string;
}

export function Component(options: Options) {



  return (target) => {
    // get @Input properties

    options.inputs = getInputMetadata(target);

    d('annotating component', options.selector, options.inputs);

    if (options.templateUrl) {
      // TODO implement loading of templates given a relative path
    }

    d('creating custom component', options.selector);

    Reflect.defineMetadata(ComponentSymbol, options, target);

    customElements.define(options.selector, target);

    // return target;
  };
}

export function getComponentMetadata(target): Options {
  return Reflect.getMetadata(ComponentSymbol, target);
}

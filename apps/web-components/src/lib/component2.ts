/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getDebugger } from '@microgamma/loggator';
import { Subject } from 'rxjs';
import { getInputMetadata } from './input';

export const webComponents = [];

export type Pipe = (values: any, options?: any) => any;

const pipes: { [name: string]: Pipe } = {};

export function registerPipe(name: string, fn: Pipe) {
  pipes[name] = fn;
}


export type Directive = (node: Element, value: any) => void;

const directives: { [name: string]: Directive; } = {};

export function registerDirective(name: string, fn: Directive) {
  directives[name] = fn;
}

const d = getDebugger('web-components:component-decorator');

const ComponentSymbol = Symbol('@Component');

export interface Options {
  selector: string;
  template?: string | ((comp: any) => string);
  templateUrl?: string;
  inputs?: string[];
  // templateHtml?: (comp: any) => string;
}

interface AttributeChanged {
  event: 'attributedChanged',
  payload: {
    name: string;
    newValue: any;
    oldValue: any;
  }
}

interface OnInit {
  event: 'onInit';
}

interface ViewInit {
  event: 'viewInit';
}

type LifeCycle = AttributeChanged | OnInit | ViewInit;


export function Component(options: Options) {


  const template = document.createElement('template');

  if (typeof options.template === 'string') {
    template.innerHTML = options.template;
  } else {
    console.error('TBD??');
  }


  eachNode(template.content, (node) => {

    let data;

    if (node.nodeType === 3) {
      if (node.textContent.match(/\{\{([^}]+)}}/)) {
        data = document.createProcessingInstruction('fx', node.textContent);
        data.addEventListener('click', () => {
          console.log(data, 'clicked');
        })
        node.parentNode.insertBefore(data, node);
      }
    }

    if (node.nodeType === 1) {

      // @ts-ignore
      for (const attr of [...node.attributes]) {

        // scan attributes with value such as {{name}}
        if (attr?.value.match(/\{\{([^}]+)}}/)) {
          // @ts-ignore
          node.setAttributeNS('fx-shadow', attr.name, attr.value);
          node.removeAttribute(attr.name);
        }

        if (attr.name in directives) {

          d('found directive', attr.name);
        }
      }

    }

  });

  return (target) => {

    const klass = class extends target {
      private nativeElement: HTMLElement;

      static {

        options.inputs = getInputMetadata(target) || [];

        d('creating custom component', options.selector);

        Reflect.defineMetadata(ComponentSymbol, options, target);

        customElements.whenDefined(options.selector).then(() => {
          webComponents.push(options.selector);
          d(options.selector, 'defined!');
        }).catch((error) => {
          console.error(`failed to register ${options.selector}`, error);
        });

      }

      propertyChange: Subject<LifeCycle> = new Subject<LifeCycle>();

      constructor(...args) {
        super(...args);

        addWatchers(this as unknown as FxComponent);

      }

      setNativeElement(element: HTMLElement) {
        this.nativeElement = element;
      }
    };


    customElements.define(options.selector, class extends HTMLElement {

      log = getDebugger(`web-components:${options.selector}`);

      private controller = new klass();

      static observedAttributes = options.inputs;
      private init: boolean = false;

      constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.controller.setNativeElement(this);

        this.controller.propertyChange.subscribe((v) => {
          this.log('property changed', v);
          this.render();
        });
      }

      connectedCallback() {

        // call fxOnInit before attaching the template (unparsed) to the DOM
        if ('fxOnInit' in this.controller) {
          this.controller.fxOnInit();
        }

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        if ('fxOnViewInit' in this.controller) {
          this.controller.fxOnViewInit();
        }

        this.init = true;


        // at this point let interpolate the data
        // this is the first render.
        this.render();


        eachNode(this.shadowRoot, (node) => {
          if (node.getAttributeNames) {
            for (const attributeName of node.getAttributeNames()) {
              const eventName = attributeName.match(/\((\w+)\)/)?.[1];
              if (eventName) {

                const value = node.getAttribute(attributeName);
                const methodName = value.match(/(\w+)\(/)[1];

                console.log('adding event listener on', node);
                node.addEventListener(eventName, (event) => {
                  this.controller[methodName](event);
                });
              }
            }

          }
        });

      }

      attributeChangedCallback(name, oldValue, newValue) {
        if (this.init && oldValue !== newValue) {
          this.controller[name] = newValue;
          if ('fxOnChanges' in this.controller) {
            this.controller.fxOnChanges({name, oldValue, newValue});
          }
          this.render();
        }
      }


      render() {

        this.log('rendering starts');
        eachNode(this.shadowRoot, (node) => {

          const directivesToRun = new Map();

          if (node.previousSibling?.nodeName === 'fx') {
            const template = (node.previousSibling as ProcessingInstruction).data;
            node.textContent = render(template, this.controller);
          }

          if (node.nodeType === 1) {
            // @ts-ignore
            for (const attributeName of node.getAttributeNames()) {
              // @ts-ignore
              const shadowAttr = node.getAttributeNS('fx-shadow', attributeName);

              if (shadowAttr) {
                // @ts-ignore
                node.setAttributeNS('fx', attributeName, render(shadowAttr, this.controller));
              }

              const fxAttribute = node.getAttributeNS('fx', attributeName);

              // parse directives now! 💪
              if (attributeName in directives && fxAttribute) {

                const directive = directives[attributeName];
                directivesToRun.set(attributeName, [directive, fxAttribute]);
              }
            }

            directivesToRun.forEach(([fn, args]) => {

              fn(node, args);
            });
          }

        });
        this.log('rendering ends');

      }

    });
  };
}

export function getComponentMetadata(target): Options {
  return Reflect.getMetadata(ComponentSymbol, target);
}

function eachNode(rootNode, callback) {
  if (!callback) {
    const nodes = [];
    eachNode(rootNode, function(node) {
      nodes.push(node);
    });
    return nodes;
  }

  if (false === callback(rootNode)) {
    return false;
  }

  if (rootNode.hasChildNodes()) {
    const nodes = rootNode.childNodes;
    for (let i = 0, l = nodes.length; i < l; ++i) {
      if (false === eachNode(nodes[i], callback)) {
        return;
      }
    }
  }
}

export function render(template: string, subs: object) {

  let tpl = template;
  const variables = template.match(/\{\{([^}]+)\|?\s?(\w*)}}/g);


  for (const variable of variables) {
    /**
     * here variables is an array of template testing such as
     * ['{{name}}', {{list$ | async}}]
     *
     * we want to extract the key to get its value from subs.
     */
    const matches = variable.match(/\{\{([\w]+)\s?\|?\s?(\w+)?}}/);
    const key = matches[1];
    const pipe = matches[2];

    let value = subs[key];
    if (pipe in pipes) {
      value = pipes[pipe](value)
    }

    tpl = tpl.replace(variable, value);
  }

  return tpl;

}


export interface FxComponent {
  propertyChange: Subject<any>;
  nativeElement: HTMLElement;
}

export function addWatchers(target: FxComponent): void{
  for (const property in target) {

    if (
      ['propertyChange'].includes(property) ||
      typeof target[property] === 'function'

    ) {
      continue;
    }

    // @ts-ignore
    if (target[property] instanceof Subject) {
      console.log('this is a Subject', property);


      (target[property] as Subject<any>).subscribe((value) => {
        console.log({value});
        target.propertyChange.next(({
          event: 'attributedChanged',
          payload: {
            name: property,
            newValue: value
          }
        }));
      })
    } else {

      const shadowProp = `__${property}__`;

      Object.defineProperty(target, shadowProp, {
        enumerable: false,
        writable: true,
        value: target[property]
      });

      Object.defineProperty(target, property, {
        enumerable: true,
        get: function() {
          return target[shadowProp];
        },
        set: function(value) {
          target[shadowProp] = value;
          target.propertyChange.next(({
            event: 'attributedChanged',
            payload: {
              name: property,
              newValue: value
            }
          }));
        }
      });

    }

  }

}

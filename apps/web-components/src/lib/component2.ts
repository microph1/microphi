/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getDebugger } from '@microgamma/loggator';
import { Subject } from 'rxjs';
import { getInputMetadata } from './input';
import { EventEmitter } from 'events';

export const webComponents = [];

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
        node.parentNode.insertBefore(data, node);
      }
    }

    if (node.nodeType === 1) {

      // @ts-ignore
      for (const attr of [...node.attributes]) {
        if (attr?.value.match(/\{\{([^}]+)}}/)) {
          // @ts-ignore
          node.setAttributeNS('fx-shadow', attr.name, attr.value);
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

      lifecycle: Subject<LifeCycle> = new Subject<LifeCycle>();

      constructor(...args) {
        super(...args);

        for (const property in this) {

          if (
            ['lifecycle'].includes(property)
          ) {
            continue;
          }

          const shadowProp = `__${property}__`;

          Object.defineProperty(this, shadowProp, {
            enumerable: false,
            writable: true,
            value: this[property]
          });

          Object.defineProperty(this, property, {
            enumerable: true,
            get: function() {
              return this[shadowProp];
            },
            set: function(value) {
              this[shadowProp] = value;
              if (property in options.inputs) {
                this.nativeElement.setAttributeNS('fx', property, value);
              }
              this.nativeElement.render();
            }
          });

        }

        this.lifecycle.subscribe((event) => {
          d(options.selector, 'lifecycle', event.event);

          if (event.event === 'attributedChanged') {

            d(options.selector, event.event, event.payload.name);
            this[event.payload.name] = event.payload.newValue;

            if ('fxOnChanges' in this) {
              this.fxOnChanges(event.payload);
            }
          }

          if (event.event === 'onInit') {

            if ('fxOnInit' in this) {
              this.fxOnInit();
            }
          }

          if (event.event === 'viewInit') {

            if ('fxOnViewInit' in this) {

              this.fxOnViewInit();
            }
          }
        });

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
      }

      connectedCallback() {


        // call fxOnInit before attaching the template (unparsed) to the DOM
        this.controller.lifecycle.next({
          event: 'onInit'
        });

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.controller.lifecycle.next({
          event: 'viewInit'
        });

        this.init = true;


        // at this point let interpolate the data
        this.render();


        eachNode(this.shadowRoot, (node) => {
          if (node.getAttributeNames) {
            for (const attributeName of node.getAttributeNames()) {
              const eventName = attributeName.match(/\((\w+)\)/)?.[1];
              if (eventName) {

                const value = node.getAttribute(attributeName);
                const methodName = value.match(/(\w+)\(/)[1];
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

          this.controller.lifecycle.next({
            event: 'attributedChanged',
            payload: {name, oldValue, newValue}
          });

          this.render();

        }
      }


      render() {

        this.log('rendering');
        eachNode(this.shadowRoot, (node) => {

          if (node.previousSibling?.nodeName === 'fx') {
            const template = (node.previousSibling as ProcessingInstruction).data;
            this.log('rendering', render(template, this.controller));
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
            }
          }



        });

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
  const variables = template.match(/\{\{[^}]+}}/g);


  for (const variable of variables) {
    const value = subs[variable.slice(2, -2)];

    tpl = tpl.replace(variable, value);
  }

  return tpl;

}

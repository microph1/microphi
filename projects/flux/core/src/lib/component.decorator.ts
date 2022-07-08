import { getDebugger } from '@microgamma/loggator';
import { Subject } from 'rxjs';
import { getInputMetadata } from './input.decorator';
import { addWatchers, FxComponent } from './add-watcher';
import { parseTemplate } from './parse-template';

const d = getDebugger('@flux:core:component-decorator');


export const webComponents = [];

export type Pipe = (values: any, options?: any) => any;

export const pipes: { [name: string]: Pipe } = {};

export function registerPipe(name: string, fn: Pipe) {
  pipes[name] = fn;
}


export type Directive = (node: Element, value: any) => void;

export const directives: { [name: string]: Directive; } = {};

export function registerDirective(name: string, fn: Directive) {
  directives[name] = fn;
}


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
          d(data, 'clicked');
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

      log = getDebugger(`@flux:core:${options.selector}`);

      private controller = new klass();

      static observedAttributes = options.inputs;
      private init: boolean = false;

      constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.controller.setNativeElement(this);

        this.controller.propertyChange.pipe(
          // TODO this makes tests fail. We still want to use it to reduce number of renders
          // debounceTime(10),
        ).subscribe((v) => {
          this.log('property changed', v);
          if (this.init) {
            this.render();
          }
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

                // console.log('adding event listener on', node);
                node.addEventListener(eventName, (event) => {
                  this.controller[methodName](event);
                });
              }
            }

          }
        });

      }

      attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
          this.controller[name] = newValue;
          if ('fxOnChanges' in this.controller) {
            this.controller.fxOnChanges({name, oldValue, newValue});
          }
        }
      }


      render() {

        this.log('rendering starts');
        eachNode(this.shadowRoot, (node) => {

          const directivesToRun = new Map();

          if (node.previousSibling?.nodeName === 'fx') {
            const template = (node.previousSibling as ProcessingInstruction).data;
            node.textContent = parseTemplate(template, this.controller);
          }

          if (node.nodeType === 1) {
            // @ts-ignore
            for (const attributeName of node.getAttributeNames()) {
              // @ts-ignore
              const shadowAttr = node.getAttributeNS('fx-shadow', attributeName);

              if (shadowAttr) {
                // @ts-ignore
                node.setAttributeNS('fx', attributeName, parseTemplate(shadowAttr, this.controller));
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
  return Reflect.getMetadata(ComponentSymbol, target.constructor);
}

function eachNode(rootNode: Node, callback) {
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

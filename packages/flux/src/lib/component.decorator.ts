/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDebugger } from '@microphi/debug';
import { Injectable } from '@microphi/di';
import { Subject, combineLatest, debounceTime } from 'rxjs';
import { FxComponent, addWatchers } from './add-watcher';
import { start$ } from './app.decorator';
import { getInputMetadata } from './input.decorator';
import { getValue, parseTemplate } from './parse-template';

const SQUARE_BOXED_REGEX = new RegExp(/^\[(\w*)\]$/);
const DOUBLE_SQUARE_BOXED_REGEX = new RegExp(/\[\[(\w+)]]/);
const EVENT_REGEX = new RegExp(/\((\w+)\)/);
const CURLY_BOXED_REGEX = new RegExp(/\{\{([^}]+)}}/);

const IGNORED = ['SCRIPT', 'LINK'];



export type Pipe = (values: any, options?: any) => any;

export const pipes: { [name: string]: Pipe } = {};

export function registerPipe(name: string, fn: Pipe) {
  pipes[name] = fn;
}


export type Directive = (node: Element, value: any, controller: any) => void;

export const directives: { [name: string]: Directive; } = {};

export function registerDirective(name: string, fn: (node: any, value: string, controller: any) => void) {
  // console.log('registering directive', name);
  directives[name] = fn;
}

const globalStyles: string[] = [];
export function registerGlobalStyles(...styles: string[]) {
  globalStyles.push(...styles);
}

const ComponentSymbol = Symbol('@Component');

export interface ComponentOptions {
  selector: string;
  template?: string;
  templateUrl?: string;
  inputs?: string[];
  // templateHtml?: (comp: any) => string;
  style?: string;
  styleUrls?: string[];
}

interface AttributeChanged {
  event: 'attributeChanged',
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


export function Component(options: ComponentOptions): ClassDecorator {

  const d = getDebugger(`@flux:@Component:${options.selector}`);

  d('decorating', options.selector);

  const templateElm = document.createElement('template');

  const {templateUrl, template} = options;

  const templateLoaded$ = new Promise((resolve) => {

    if (template) {
      templateElm.innerHTML = template;
      resolve(true);
    } else if (templateUrl) {
      // template needs to be deferred;

      fetch(templateUrl)
        .then((response) => {
          return response.text();
        }).then((template) => {

          templateElm.innerHTML = template;
          resolve(true);
        });

    } else {
      resolve(true);
      console.warn('no template found on', options.selector);
    }
  });



  return (target: any) => {

    Reflect.defineMetadata(ComponentSymbol, options, target);

    // this is the class that represents the controller available
    // inside every custom element
    const klass = class extends target {
      nativeElement!: HTMLElement;

      static {

        options.inputs = getInputMetadata(target) || [];

        d('creating custom component', options.selector);

        Reflect.defineMetadata(ComponentSymbol, options, target);
      }

      propertyChange: Subject<LifeCycle> = new Subject<LifeCycle>();

      constructor(...args: any[]) {
        super(...args);
        addWatchers(this as unknown as FxComponent);
      }

      setNativeElement(element: HTMLElement) {
        this.nativeElement = element;
      }
    };


    customElements.define(options.selector, class extends HTMLElement {

      log = getDebugger(`@flux:${options.selector}`);

      public parent!: Node;

      public fxId = Math.random().toString(36).slice(2);

      static observedAttributes = options.inputs;

      private inited: boolean = false;

      private readonly controller = new klass(this);
      private readonly connected$ = new Subject<void>();
      private readonly scheduleRender$ = new Subject<Node>();

      get content(): Node {
        return this.shadowRoot!;
      }

      constructor() {
        super();

        combineLatest([
          this.connected$,
          start$,
        ]).pipe().subscribe(() => {
          this.log('------------------------- component starting now -------------------------');
          this.render();
        });

        this.attachShadow({mode: 'open'});

        this.controller.setNativeElement(this);

        combineLatest([
          this.controller.propertyChange,
          start$,
          // should not start firing changes untill component is connected
          this.connected$,
        ]).pipe(
          debounceTime(0),
        ).subscribe(([v]) => {
          this.log('property changed', v.event);

          if ('fxOnChanges' in this.controller) {
            this.controller['fxOnChanges'](v);
          }

          this.render();
        });

        this.scheduleRender$
          .pipe(
            debounceTime(1),
          )
          .subscribe(() => {
            this.render();

          });
      }

      override appendChild<T extends Node>(node: T): T {

        this.log('appendingChild', node);

        return this.shadowRoot!.appendChild(node);
      }


      public connectedCallback() {
        this.log('connectedCallback');

        this.setAttributeNS('fx', 'fx-component', options.selector);
        this.setAttributeNS('fx', 'fx-id', this.fxId);

        // call fxOnInit before attaching the template (unparsed) to the DOM
        if ('fxOnInit' in this.controller) {
          this.controller['fxOnInit']();
        }

        templateLoaded$.then(() => {

          if (options.styleUrls || globalStyles) {

            for (const url of [...globalStyles, ...options.styleUrls || []]) {
              const style = document.createElement('link');
              style.rel = 'stylesheet';
              style.href = url;
              this.shadowRoot!.appendChild(style!.cloneNode(true));
            }
          }

          if (options.style) {

            const style = document.createElement('style');
            style.textContent = options.style;

            this.shadowRoot?.appendChild(style);
          }

          if (templateElm) {
            this.shadowRoot!.appendChild(templateElm.content.cloneNode(true));
          }

          // components without template should still fire connected$
          this.connected$.next();
        });

      }

      public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        this.log('attributeChangedCallback');
        if (oldValue !== newValue) {
          // values are always string because they're the old/new value set using
          // `setAttribute(name, newValue)`
          // when the attribute is a [name] (boxed type attribute),
          // such as `<input [value]="myValue">`
          // then during render phase the actual value (i.e.: not `stringified`)
          // is set on this.controller.nativeElement.myValue
          // in fact this.controller.nativeElement is the `node` during within the
          // render method.

          // so if the attribute is boxed `[value]` then we want to json parse newValue
          // otherwise se just take as it is

          const isBoxedAttribute = this.attributes.getNamedItem(`[${name}]`);

          if (isBoxedAttribute) {

            // maybe if it's a boxed attribute we should `eval` it
            this.controller[name] = this.controller.nativeElement[name] || JSON.parse(newValue);

          } else {

            this.controller[name] = this.controller.nativeElement[name] || newValue;
          }


          // skip changes until component is not initialized
          if ('fxOnChanges' in this.controller && this.inited) {
            this.controller['fxOnChanges']({name, oldValue, newValue});
          }
        }
      }

      render() {
        //console.count(`render${this.fxId}`);
        const walker = document.createTreeWalker(this.content, NodeFilter.SHOW_ELEMENT, (node) => {
          if (node instanceof HTMLElement && IGNORED.includes(node.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        });

        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (node instanceof HTMLElement) {
            node['fx'] ? '' : node['fx'] = {};
            // console.log('parsing node', node);
            // check if a node has been inited
            if (!node['fx']?.inited) {

              for (const attributeName of node.getAttributeNames()) {
                if (attributeName.startsWith('fx')) {
                  continue;
                }

                const attributeValue = node.getAttribute(attributeName);
                if (!attributeValue) {
                  // console.log('attribute value is falsy... continuing');
                  continue;

                }


                const eventName = attributeName.match(EVENT_REGEX)?.[1];
                if (eventName) {

                  const methodName = attributeValue?.match(/(\w+)\(/)?.[1];
                  if (methodName) {
                    if (typeof this.controller[methodName] !== 'function') {
                      throw new Error(`${methodName} should be a method`);
                    }

                    this.log('adding event listener on', node, 'to controller', this);

                    node.addEventListener(eventName, (event: any) => {
                      this.controller[methodName](event);
                    });

                  } else {
                    console.warn('TBD: we should be able to handle inline scripts');
                  }

                }

                const squareBoxed = attributeName.match(SQUARE_BOXED_REGEX)?.[1];
                if (squareBoxed) {
                  this.log(`found [${squareBoxed}]`);
                  this.log('attribute value', attributeValue);
                }

                if (attributeValue.match(CURLY_BOXED_REGEX)) {
                  // here we store the original template of the attribute
                  // say we have
                  // <slot style="display: {{showContent}};"></slot>
                  node['fx'][attributeName] = attributeValue;
                  // then we have
                  // <slot style="display: {{showContent}};" fx-style="display: {{showContent}};"></slot>
                  // because after first render we will have
                  // <slot style="display: none;" fx-style="display: {{showContent}};"></slot>
                  // and we will need the original value on the second render

                }

                if (attributeName.match(DOUBLE_SQUARE_BOXED_REGEX)) {
                  // TODO we do not need to do this actually
                  // const evaluableName = attributeName.match(DOUBLE_SQUARE_BOXED_REGEX)[1];
                  // node.setAttribute(`fx-${evaluableName}-evaluable`, node.getAttribute(attributeName));
                }
              }

              node['fx'] = {...node['fx'], inited: true, parentController: this.controller};
            }

          }
        }

        if (!this.inited) {

          this.log('first rendering done');
          this.inited = true;

          // call lifecycle after first render is done
          if ('fxOnViewInit' in this.controller) {
            this.controller['fxOnViewInit']();
          }

        }

        this.log('rendering starts');
        const walker3 = document.createTreeWalker(this.content, NodeFilter.SHOW_ELEMENT, (node) => {
          if (node instanceof HTMLElement && IGNORED.includes(node.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        });

        while (walker3.nextNode()) {
          const node = walker3.currentNode as HTMLElement;
          node['fx'] ? '' : node['fx'] = {};

          this.log(node);

          for (const attributeName of node.getAttributeNames()) {

            // check double square boxed attributes
            const doubleSquared = attributeName.match(DOUBLE_SQUARE_BOXED_REGEX)?.[1];
            if (doubleSquared) {
              const conditionToEvaluate = node.getAttribute(attributeName);
              this.log({conditionToEvaluate});

              if (conditionToEvaluate !== null) {
                const result = evalInScope(conditionToEvaluate, this.controller);
                if (!node['controller']) {
                  throw new Error(`${node.tagName} does not have a controller while it should. Are you forgetting to import it?`);
                }
                node['controller'][doubleSquared] = result;
                this.log({result});
              }

            }


            // check square boxed attributes
            const unboxed = attributeName.match(SQUARE_BOXED_REGEX)?.[1];
            // parse [attr] boxed attributes
            if (unboxed) {
              this.log(`found square boxed attribute: ${attributeName}`);

              const property = node.getAttribute(attributeName);

              if (property !== null) {

                const value = getValue(property, this.controller);
                node.setAttribute(unboxed, value);
                // so that input updates
                node[unboxed] = value;
              }

            }


            // check if there's a fx- attribute which means that an attribute
            // need to be rendered ie. we have something like
            // <slot style="display: {{mode}}"></slot>
            // which once rendered becomes
            // <slot style="display: 'block'"></slot>
            // so in fxAttribute we have the original template
            const fxAttribute = node['fx'][attributeName];

            if (fxAttribute) {
              // if that's the case then we will have the template to render in `fxAttribute`
              const value = parseTemplate(fxAttribute, { ...this.controller });
              node.setAttribute(attributeName, value);

            }
          }

        }


        this.log('redering text nodes with {{}}');

        const textNodesWalker = document.createTreeWalker(this.content, NodeFilter.SHOW_TEXT, (node) => {
          // do we need to check further parents?
          const parentElement = node.parentElement;

          if (parentElement && IGNORED.includes(parentElement.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;

        });

        while (textNodesWalker.nextNode()) {

          const node = textNodesWalker.currentNode;
          const needsIterpolation = node.textContent?.match(CURLY_BOXED_REGEX);
          if (!needsIterpolation?.[1]) {
            if (node['fx']?.template) {
              const parentFxComponent = getParentController(node);
              node.textContent = parseTemplate(node['fx'].template, { ...this.controller, ...node['controller'], ...parentFxComponent});
            }
            continue;
          }

          const parentElement = node.parentElement;

          node['fx'] = { template: needsIterpolation.input, };


          // console.log('getting parent element');


          if (parentElement) {
            const template = node['fx'].template;

            if (template) {
              node.textContent = parseTemplate(template, { ...this.controller, ...getParentController(node) });
            }

          }
        }

        this.log('all nodes with {{}} rendered');
        this.log('rendering ends');


      }

    });

    const injectableTarget = Injectable()(klass);
    Reflect.defineMetadata(ComponentSymbol, options, injectableTarget);

    return injectableTarget;

  };
}

export function getComponentMetadata(target: any): ComponentOptions {

  return Reflect.getMetadata(ComponentSymbol, target);
}

export function getComponentMetadataFromInstance(target: any): ComponentOptions {

  return Reflect.getMetadata(ComponentSymbol, target.constructor);
}

export function getParentController(node: Node): null|object {
  if (!node || !node.parentNode) {
    return null;
  }

  if ('controller' in node.parentNode) {
    return node.parentNode['controller'] as object;
  } else {
    return getParentController(node.parentNode);
  }

}

function evalInScope(js: string, contextAsScope: object) {
  return new Function(`with (this) {  return ${js} }`).call(contextAsScope);
}

// function isFxComponent<T extends Node>({}: T) {
//
//   // console.log({node});
//   // return [...children].some((node) => {
//   //   return node instanceof Element && !!node.getAttribute('fxId');
//   // });
//
//   return false;
//
// }

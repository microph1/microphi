/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@microphi/di';
import { AsyncSubject, Subject, combineLatest, debounceTime, takeUntil } from 'rxjs';
import { FxComponent, addWatchers } from './add-watcher';
import { start$ } from './app.decorator';
import { getInputMetadata } from './input.decorator';
import { getValue, parseTemplate } from './parse-template';
import { getHostListeners } from './decorators/host-listener.decorator';
import { getViewChildMetadata } from './decorators/view-child.decorator';

const SQUARE_BOXED_REGEX = new RegExp(/^\[(\w*)\]$/);
const DOUBLE_SQUARE_BOXED_REGEX = new RegExp(/\[\[(\w+)]]/);
const EVENT_REGEX = new RegExp(/\((\w+)\)/);
const CURLY_BOXED_REGEX = new RegExp(/\{\{([^}]+)}}/);

const IGNORED = ['SCRIPT', 'LINK', 'NO-SCRIPT'];



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

export interface FxElement<T> {
  controller: T;
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

export interface OnInit {
  fxOnInit(): void;
}

export function hasOnInit(instance: unknown): instance is OnInit {
  return typeof (instance as OnInit).fxOnInit === 'function';
}


export interface OnViewInit {
  fxOnViewInit(): void;
}

export function hasOnViewInit(instance: unknown): instance is OnViewInit {
  return typeof (instance as OnViewInit).fxOnViewInit === 'function';
}

export interface OnDestroy {
  fxOnDestroy(): void;
}

export function hasOnDestroy(instance: unknown): instance is OnDestroy {
  return typeof (instance as OnDestroy).fxOnDestroy === 'function';
}

export interface PropertyChange<k extends string|number|symbol, T = unknown> {
  name: k;
  oldValue: T;
  newValue: T;
}

export type Changes<T extends object> = {
  [k in keyof T]: PropertyChange<k, T[k]>;
}


export interface OnChanges<T extends object> {
  fxOnChanges(changes: Changes<T>): void;
}

export function hasOnChange(instance: unknown): instance is OnChanges<any> {
  return typeof (instance as OnChanges<any>).fxOnChanges === 'function';
}

export function Component(options: ComponentOptions): ClassDecorator {



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

        Reflect.defineMetadata(ComponentSymbol, options, target);
      }

      propertyChange = new Subject<Changes<any>>();

      constructor(...args: any[]) {
        super(...args);
        addWatchers(this as unknown as FxComponent);
      }

      setNativeElement(element: HTMLElement) {
        this.nativeElement = element;
      }
    };


    customElements.define(options.selector, class extends HTMLElement {

      public parent!: Node;

      public fxId = Math.random().toString(36).slice(2);

      static observedAttributes = options.inputs;

      private inited: boolean = false;

      private readonly controller = new klass(this);
      private readonly connected$ = new Subject<void>();
      private readonly scheduleRender$ = new Subject<Node>();

      private disconnected$ = new AsyncSubject<void>();

      get content(): Node {
        return this.shadowRoot!;
      }

      constructor() {
        super();

        combineLatest([
          this.connected$,
          start$,
        ]).pipe(
          takeUntil(this.disconnected$),
        ).subscribe(() => {
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
          takeUntil(this.disconnected$),
        ).subscribe(([v]) => {

          if (hasOnChange(this.controller)) {
            this.controller.fxOnChanges(v);
          }

          this.render();
        });

        this.scheduleRender$
          .pipe(
            debounceTime(1),
            takeUntil(this.disconnected$),
          )
          .subscribe(() => {
            this.render();
          });

      }

      override appendChild<T extends Node>(node: T): T {


        return this.shadowRoot!.appendChild(node);
      }


      public connectedCallback() {

        this.setAttributeNS('fx', 'fx-component', options.selector);
        this.setAttributeNS('fx', 'fx-id', this.fxId);

        // call fxOnInit before attaching the template (unparsed) to the DOM
        if (hasOnInit(this.controller)) {
          this.controller.fxOnInit();
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

          // get @HostListeners
          const listeners = getHostListeners(this.controller);
          for (const listener of listeners) {
            this.shadowRoot!.addEventListener(listener.event, (event) => {
              this.controller[listener.handler](event);
            });

          }
          // components without template should still fire connected$
          this.connected$.next();
        });

      }


      disconnectedCallback() {
        if (hasOnDestroy(this.controller)) {
          this.controller.fxOnDestroy();
        }
        this.disconnected$.next();
        this.disconnected$.complete();
      }

      public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
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
            this.controller[name] = this.controller.nativeElement[name] ?? eval(newValue);

          } else {

            this.controller[name] = this.controller.nativeElement[name] ?? newValue;
          }


          // skip changes until component is not initialized
          // also this.controller[name] is annotated with @Input then we need to avoid double ngChanges
          if (isBoxedAttribute) {

            // TODO we need to to test this better
            if (!options.inputs?.includes(name)) {

              if (hasOnChange(this.controller) && this.inited) {
                this.controller.fxOnChanges({ name, oldValue, newValue } as unknown as Changes<any>);
              }

            }
          } else {

            if (hasOnChange(this.controller) && this.inited) {
              this.controller.fxOnChanges({ name, oldValue, newValue } as unknown as Changes<any>);
            }

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
                if (attributeName?.startsWith('#')) {
                  const name = attributeName.slice(1);
                  this.controller[name] = node;
                }

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
                    let controller: any;

                    if (typeof this.controller[methodName] === 'function') {

                      controller = this.controller;

                    } else if (typeof this['fx']?.parentController?.[methodName] === 'function') {

                      // not sure we should do this
                      // this is to allow a custom component to access the upstream method
                      // like when we have an element inside the fx-for and the
                      // event listeners need to actually be bound to the parent controller
                      controller = this['fx'].parentController;

                    } else {

                      throw new Error(`Unable to find ${methodName}`);
                    }


                    const args = attributeValue.match(/\((.+)?,*\)/)?.[1]?.split(',').map((arg) => arg.trim());

                    node.addEventListener(eventName, (event: Event) => {

                      // Please note: by default allow bubbling
                      // so that the user can decide whether to stop it on not
                      // in each handler

                      const resolvedArguments: any[] = [];

                      if (args) {

                        for (const arg of args) {
                          //console.log('handling arg:', arg);

                          if (arg === '$event') {
                            // special word to inject actual DOM event
                            //
                            resolvedArguments.push(event);
                          }

                          const resolvedArg = evalInScope(arg, controller);

                          resolvedArguments.push(resolvedArg);

                        }

                      }

                      const method = controller[methodName];

                      if (method && typeof method === 'function') {
                        // eslint-disable-next-line @typescript-eslint/ban-types
                        (method as Function).apply(controller, resolvedArguments);

                      }
                    });

                  } else {
                    console.warn('TBD: we should be able to handle inline scripts');
                  }

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

        const walker3 = document.createTreeWalker(this.content, NodeFilter.SHOW_ELEMENT, (node) => {
          if (node instanceof HTMLElement && IGNORED.includes(node.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        });

        while (walker3.nextNode()) {
          const node = walker3.currentNode as HTMLElement;
          node['fx'] ? '' : node['fx'] = {};


          for (const attributeName of node.getAttributeNames()) {

            // check double square boxed attributes
            const doubleSquared = attributeName.match(DOUBLE_SQUARE_BOXED_REGEX)?.[1];
            if (doubleSquared) {
              const conditionToEvaluate = node.getAttribute(attributeName);

              if (conditionToEvaluate !== null) {
                const result = evalInScope(conditionToEvaluate, this.controller);
                if (!node['controller']) {
                  throw new Error(`${node.tagName} does not have a controller while it should. Are you forgetting to import it?`);
                }
                node['controller'][doubleSquared] = result;
              }

            }


            // check square boxed attributes
            const unboxed = attributeName.match(SQUARE_BOXED_REGEX)?.[1];
            // parse [attr] boxed attributes
            if (unboxed) {

              const property = node.getAttribute(attributeName);

              if (property !== null) {

                const parentController = getParentController(node);

                const dataset = Object.entries(node.dataset).reduce((acc, [key, value]) => {
                  acc[key] = JSON.parse(value || '');
                  return acc;
                }, {});

                const value = getValue(property, {
                  ...this.controller,
                  ...parentController,
                  ...dataset,
                });

                // so that input updates
                node[unboxed] = value;
                // important: this will trigger changes so it have to happen after the line above
                node.setAttribute(unboxed, value);
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
              const parentFxComponent = getParentController(node);

              const dataset = Object.entries(node.dataset).reduce((acc, [key, value]) => {
                acc[key] = JSON.parse(value || '');
                return acc;
              }, {});

              const value = parseTemplate(fxAttribute, { ...this.controller, ...node['controller'], ...parentFxComponent, ...dataset });
              node.setAttribute(attributeName, value);

            }
          }

        }

        //this.log('rendering text nodes with {{}}');

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
              // parse data stored in dataset
              const dataset = Object.entries(parentElement.dataset).reduce((acc, [key, value]) => {
                acc[key] = JSON.parse(value || '');
                return acc;
              }, {});

              node.textContent = parseTemplate(template, {
                ...this.controller,
                ...getParentController(node),
                ...dataset,
              });
            }

          }
        }


        // parse @ViewChild decorator
        const viewchildren = getViewChildMetadata(target);
        if (viewchildren) {

          for (const viewChild of viewchildren) {

            if (!(viewChild.property in this.controller)) {
              console.error('Unable to link @ViewChild', viewChild);
            }

          }
        }


        if (!this.inited) {

          this.inited = true;

          // call lifecycle after first render is done
          if (hasOnViewInit(this.controller)) {
            this.controller.fxOnViewInit();
          }

        }

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


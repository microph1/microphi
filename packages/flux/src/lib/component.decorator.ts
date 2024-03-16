import { getDebugger } from '@microphi/debug';
import { combineLatest, debounceTime, Subject } from 'rxjs';
import { getInputMetadata } from './input.decorator';
import { addWatchers, FxComponent } from './add-watcher';
import { Injectable } from '@microgamma/digator';
import { start$ } from './app.decorator';
import { getValue, parseTemplate } from './parse-template';
import { traverse } from './traverse';

const SQUARE_BOXED_REGEX = new RegExp(/^\[(\w*)\]$/);
const DOUBLE_SQUARE_BOXED_REGEX = new RegExp(/\[\[(\w+)]]/);
const EVENT_REGEX = new RegExp(/\((\w+)\)/);
const CURLY_BOXED_REGEX = new RegExp(/\{\{([^}]+)}}/);

export const HydratedSymbol = Symbol('@Hydrated');

export function Hydrated(scope: string = ''): PropertyDecorator {

  return (target, property) => {
    Reflect.defineMetadata(HydratedSymbol, scope, target, property);
  };

}

export type Pipe = (values: any, options?: any) => any;

export const pipes: { [name: string]: Pipe } = {};

export function registerPipe(name: string, fn: Pipe) {
  pipes[name] = fn;
}


export type Directive = (node: Element, value: any, controller: any) => void;

export const directives: { [name: string]: Directive; } = {};

export function registerDirective(name: string, fn: (node: any, value: string, controller: any) => void) {
  console.log('registering directive', name);
  directives[name] = fn;
}

const ComponentSymbol = Symbol('@Component');

export interface ComponentOptions {
  selector: string;
  template?: string | ((comp: any) => string);
  templateUrl?: string;
  inputs?: string[];
  // templateHtml?: (comp: any) => string;
  shadowRoot?: boolean;
  style?: string;
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

  const template = document.createElement('template');

  if (typeof options.template === 'string') {
    template.innerHTML = options.template;
  } else if (typeof options.template === 'function') {
    // template needs to be deferred;
  } else {
    console.warn('no template found on', options.selector);
  }

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

      constructor(...args) {
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
      private readonly transcludedTemplate!: string;
      private readonly connected$ = new Subject<void>();
      private nodesMap = new WeakMap<HTMLElement, string>();

      get content(): Node {

        if (options.shadowRoot) {
          // if option is set then `this.shadowRoot` cannot be null
          return this.shadowRoot!;
        }

        return this;
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


        if (options.shadowRoot) {
          this.attachShadow({mode: 'open'});
        }

        this.controller.setNativeElement(this);

        combineLatest([
          this.controller.propertyChange,
          start$,
        ]).pipe(
          // debounceTime(10),
        ).subscribe(([v]) => {
          this.log('property changed', v.event);
          if ('fxOnChanges' in this.controller) {

            this.controller['fxOnChanges'](v);
          }
          this.render();
        });
      }

      override appendChild<T extends Node>(node: T): T {

        // instrumentTemplate(node, this.shadowRoot);
        if (options.shadowRoot)
          return  this.shadowRoot!.appendChild(node);
        else
          return super.appendChild(node);
      }

      public connectedCallback() {
        this.log('connectedCallback');

        this.setAttributeNS('fx', 'fx-component', options.selector);
        this.setAttributeNS('fx', 'fx-id', this.fxId);

        // call fxOnInit before attaching the template (unparsed) to the DOM
        if ('fxOnInit' in this.controller) {
          this.controller['fxOnInit']();
        }

        if (options.shadowRoot) {
          this.shadowRoot!.appendChild(template.content.cloneNode(true));
        } else {
          // if (typeof options.template === 'string') {
          //   this.appendChild(template.content.cloneNode(true));
          // } else {
          //
          //   // @ts-ignore
          //   template.innerHTML = options.template(this.controller);
          //   this.appendChild(template.content.cloneNode(true));
          // }
        }

        this.connected$.next();
        this.connected$.complete();

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
        // traverse the dom starting from `this.content` excluding
        // other web components and their children
        [...traverse(this.content, options.shadowRoot)].forEach((node) => {
          if (!this.nodesMap.has(node)) {
            // only parse new nodes

            node['fx'] ? '' : node['fx'] = {};

            for (const attributeName of node.getAttributeNames()) {
              if (attributeName.startsWith('fx')) {
                continue;
              }

              const attributeValue = node.getAttribute(attributeName);


              const eventName = attributeName.match(EVENT_REGEX)?.[1];
              if (eventName) {

                const methodName = attributeValue.match(/(\w+)\(/)[1];

                this.log('adding event listener on', node, 'to controller', this);

                node.addEventListener(eventName, (event: any) => {
                  this.controller[methodName](event);
                });
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

            this.nodesMap.set(node, (node as HTMLElement).innerHTML);
          }
        });


        if (this.inited) {


          this.log('first rendering done');
          this.inited = true;

          // call lifecycle after first render is done
          if ('fxOnViewInit' in this.controller) {
            this.controller['fxOnViewInit']();
          }
        }

        this.log('rendering starts');

        [...traverse(this.content, options.shadowRoot)].forEach((node: HTMLElement) => {
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

          const template = this.nodesMap.get(node);

          if (template) {
            // fx-if does not have a template
            (node as HTMLElement).innerHTML = parseTemplate(template, { ...this.controller, ...node['controller'] });
          }
        });


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

export function getParentController(node: Node) {
  if (!node || !node.parentNode) {
    return null;
  }

  if ('controller' in node.parentNode) {
    return node.parentNode['controller'];
  } else {
    return getParentController(node.parentNode);
  }

}

function evalInScope(js: string, contextAsScope: object) {
  return new Function(`with (this) {  return ${js} }`).call(contextAsScope);
}

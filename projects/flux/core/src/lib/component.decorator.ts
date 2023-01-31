import { getDebugger } from '@microgamma/loggator';
import { combineLatest, Subject } from 'rxjs';
import { getInputMetadata } from './input.decorator';
import { addWatchers, FxComponent } from './add-watcher';
import { parseTemplate } from './parse-template';
import { Injectable } from '@microgamma/digator';
import { start$ } from './app.decorator';

const d = getDebugger('@flux:core:@Component');

function* traverse(node: any, includeAllChildren) {

  const children = node.childNodes;

  for (const child of children) {
    yield child;

    if (child.hasChildNodes()) {

      // when shadow dom is used we can scan also the children because
      // the component's template elements are inside the shadow dom node hence not visible
      // on the other hand when not using shadow dow we need to avoid scanning a custom element children
      // otherwise wrong bindings will happen
      if (includeAllChildren) {

        yield* traverse(child, includeAllChildren);

      } else {

        const childName = 'getAttributeNS' in child ? child.getAttributeNS('fx', 'fx-component') : undefined;

        const isWebComponent = !!childName;

        if (!isWebComponent) {
          yield* traverse(child, includeAllChildren);
        } else {
          // look for transcluded content
          // transcluded content will be withing <fx-transclude> tags
          const transcluded = child.querySelector('fx-transclude');
          if (transcluded) {
            d('found transcluded content', transcluded);
            yield transcluded;
          }
        }

      }


    }
  }
}

export const webComponents = [];

export type Pipe = (values: any, options?: any) => any;

export const pipes: { [name: string]: Pipe } = {};

export function registerPipe(name: string, fn: Pipe) {
  pipes[name] = fn;
}


export type Directive = (node: Element, value: any) => void;

export const directives: { [name: string]: Directive; } = {};

export function registerDirective(name: string, fn: Directive) {
  d('registering directive', name);
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


export function Component(options: ComponentOptions) {

  d('decorating', options.selector);
  const processingInstructionNodeName = `fx-${options.selector}`;

  const template = document.createElement('template');

  if (typeof options.template === 'string') {
    template.innerHTML = options.template;
  } else {
    console.warn('no template found on', options.selector);
  }

  [...traverse(template.content, options.shadowRoot)].forEach((node) => instrumentTemplate(node, processingInstructionNodeName));

  return (target) => {

    Reflect.defineMetadata(ComponentSymbol, options, target)

    // this is the class that rappresents the controller available
    // inside every custom element
    const klass = class extends target {
      private nativeElement: HTMLElement;

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

      log = getDebugger(`@flux:core:${options.selector}`);

      public fxId = Math.random().toString(36).slice(2);

      static observedAttributes = options.inputs;

      private init: boolean = false;
      private readonly controller = new klass();
      private readonly transcludedTemplate: string;
      private readonly connected$ = new Subject<void>();

      get content(): Node {
        if (options.shadowRoot) {
          return this.shadowRoot;
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
          // this.log('stylesheets', this.shadowRoot.styleSheets);
        } else {
          // content projection using <slot> won't work without shadowRoot
          // let grab the content to project
          if (this.innerHTML) {
            this.transcludedTemplate = this.innerHTML;
            const transcluded = document.createElement('fx-transclude');

            transcluded.innerHTML = this.transcludedTemplate;

            [...traverse(transcluded, options.shadowRoot)].forEach((node) => instrumentTemplate(node, processingInstructionNodeName));
            this.innerHTML = transcluded.outerHTML;
            this.log('innerHtml', this.transcludedTemplate);
          }

        }

        this.controller.setNativeElement(this);

        combineLatest([
          this.controller.propertyChange,
        ]).pipe().subscribe(([v]) => {
          this.log('property changed', v);
          this.render();
        });
      }

      connectedCallback() {
        this.log('connectedCallback');

        this.setAttributeNS('fx', 'fx-component', options.selector);
        this.setAttributeNS('fx', 'fx-id', this.fxId);

        // call fxOnInit before attaching the template (unparsed) to the DOM
        if ('fxOnInit' in this.controller) {
          this.controller.fxOnInit();
        }

        if (options.shadowRoot) {
          this.shadowRoot.appendChild(template.content.cloneNode(true));
        } else {
          this.appendChild(template.content.cloneNode(true));
        }

        if (options.shadowRoot) {
          // const styles = new Set<string>();
          // [...traverse(this.content)]
          //   .filter((elm) => {
          //     return elm instanceof HTMLElement;
          //   })
          //   .map((node) => {
          //     return node.classList;
          //   })
          //   .filter((list) => {
          //     return list.length > 0;
          //   })
          //   .forEach((list) => {
          //     list.forEach((klass) => {
          //       styles.add(klass);
          //     })
          //   });
          //
          // styles.forEach((klass) => {
          //   console.log('need to import ', klass, this);
          //
          //   for (const style of document.styleSheets) {
          //     console.log({style});
          //   }
          // });

        }


        if (options.style) {
          // Create an empty "constructed" stylesheet
          // const sheet = new CSSStyleSheet();
          // this.log('sheet', sheet);
          // sheet.
        }

        if ('fxOnViewInit' in this.controller) {
          this.controller.fxOnViewInit();
        }

        this.connected$.next();
        this.connected$.complete();

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

        [...traverse(this.content, options.shadowRoot)].forEach((node) => {

          const directivesToRun = new Map();

          if (node.previousSibling
            && node.previousSibling.nodeName === processingInstructionNodeName
            && ('data' in node.previousSibling)) {
            const template = (node.previousSibling as ProcessingInstruction).data;
            node.textContent = parseTemplate(template, this.controller);
          }

          if (node.nodeType === 1 && node !== this) {

            for (const attributeName of node.getAttributeNames()) {


              // console.log('parsing ', attributeName)

              // parse [attr] boxed attributes
              if (attributeName.match(/\[(.+)]/)) {
                this.log('found boxed attribute', attributeName);

                const attr = attributeName.match(/\[(.+)]/)[1]
                // console.log({attr});
                const propertyToSet = node.getAttribute(attributeName);
                // console.log({propertyToSet});

                node[attr] = this.controller[propertyToSet];

              }

              const shadowAttr = node.getAttributeNS('fx-shadow', attributeName);

              if (shadowAttr) {
                this.log('rendering on', shadowAttr);

                const value = parseTemplate(shadowAttr, this.controller);
                node.setAttributeNS('fx', attributeName, value);
              }

              const fxAttribute = node.getAttributeNS('fx', attributeName);

              this.log('parse directives now! 💪');
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


        if (!this.init) {

          // traverse the dom starting from `this.content` excluding
          // other web components and their children
          [...traverse(this.content, options.shadowRoot)].forEach((node) => {

            if (node.getAttributeNames) {

              for (const attributeName of node.getAttributeNames()) {
                const eventName = attributeName.match(/\((\w+)\)/)?.[1];
                if (eventName) {

                  const value = node.getAttribute(attributeName);
                  const methodName = value.match(/(\w+)\(/)[1];

                  console.log('adding event listener on', node, 'to controller', this);
                  node.addEventListener(eventName, (event) => {
                    this.controller[methodName](event);
                  });
                }
              }

            }
          });

          this.log('first rendering done');
          this.init = true;
        }

        this.log('rendering ends');

      }

    });

    const injectableTarget = Injectable()(klass);
    Reflect.defineMetadata(ComponentSymbol, options, injectableTarget)

    return injectableTarget;

  };
}

export function getComponentMetadata(target): ComponentOptions {

  return Reflect.getMetadata(ComponentSymbol, target);
}

export function getComponentMetadataFromInstance(target): ComponentOptions {

  return Reflect.getMetadata(ComponentSymbol, target.constructor);
}


export function instrumentTemplate(node, processingInstructionNodeName) {

  const log = getDebugger(`@flux:instrumentTemplate:${processingInstructionNodeName}`);

  if (node.nodeType === 3) {
    if (node.textContent.match(/\{\{([^}]+)}}/)) {
      log('found template binding in', node.textContent);
      const data = document.createProcessingInstruction(processingInstructionNodeName, node.textContent);
      // data.addEventListener('click', () => {
      //   d(data, 'clicked');
      // })
      node.parentNode.insertBefore(data, node);
    }
  }

  // nodeType 1 are all custom elements whether they use shadow dom or not
  if (node.nodeType === 1) {

    for (const attr of [...node.attributes]) {
      console.log('scanning attribute', attr.name);

      if ( attr?.name.match(/\[(.+)]/) ) {
        log('found attribute with [] binding');
        // const attributeName = attr?.name.match(/\[(.+)]/)[1]
        // console.log({attributeName});
        // const propertyToSet = attr.value;
        // console.log({propertyToSet});

        // node[attributeName] =
        // node.setAttributeNS('fx-shadow', attr.name, attr.value);
        // node.removeAttribute(attr.name);

      } else if (attr?.value.match(/\{\{([^}]+)}}/)) {
      // scan attributes with value such as {{name}}

        log('found attribute binding in', node.outerHTML);
        log('node.localName: ', node.localName);
        node.setAttributeNS('fx-shadow', attr.name, attr.value);
        node.removeAttribute(attr.name);
      }

      if (attr.name in directives) {

        d('found directive', attr.name);
      }
    }

  }

}

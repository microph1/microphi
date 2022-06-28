import { getDebugger } from '@microgamma/loggator';
import { getInputMetadata } from './input';
import Mustache from 'mustache';
import { getNodesWithCallableAttributes } from './utilities';
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
  template?: string;
  templateUrl?: string;
  inputs?: string[];
  templateHtml?: (comp: any) => string;
}

export function Component(options: Options) {

  const template = document.createElement('template');
  template.innerHTML = options.template;

  template.content.querySelectorAll('*').forEach((node) => {
    debugger;

  });

  return (target) => {

    const klass = class extends target {

      events = new EventEmitter();

      nativeElement: Element;

      static meta = options;

      static {

        options.inputs = getInputMetadata(target) || [];

        d('creating custom component', options.selector);

        Reflect.defineMetadata(ComponentSymbol, options, target);

        customElements.whenDefined(options.selector).then(() => {
          webComponents.push(options.selector);
          d(options.selector, 'defined!')
        }).catch((error) => {
          console.error(`failed to register ${options.selector}`, error);
        });

      }

      constructor() {
        super();
        for (const property in this) {
          console.log({property});

          const shadowProp = `__${property}__`;

          Object.defineProperty(this, shadowProp, {
            enumerable: false,
            writable: true,
            value: this[property]
          });

          Object.defineProperty(this, property, {
            enumerable: true,
            get: function () {
              return this[shadowProp];
            },
            set: function (value) {
              this[shadowProp] = value;
              this.nativeElement?.setAttribute(property, value);

              this.events.emit('changed');
            }
          });

        }

      }
    }


    customElements.define(options.selector, class extends HTMLElement {
      // todo pass this to DI
      controller = new klass();

      static observedAttributes = options.inputs;
      private nodes: { node: Element, template: string }[] = [];
      private nodesWithCallableAttributes: { node: Element; name: string; value: string }[];
      private mappedAttributes: { attribute: Attr, template: string }[] = [];
      private nodesWithDirectives: { node: Element, directive: Directive, property: string }[] = [];

      constructor() {
        super();

        this.controller.nativeElement = this;

        console.log(options);

        console.log(klass);

        this.attachShadow({mode: 'open'});

      }

      connectedCallback() {


        options.inputs.forEach((name) => {
          // this will trigger first change
          this.setAttribute(name, this.controller[name]);
        })


        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.shadowRoot.childNodes.forEach((node) => {

          if (node.nodeType === 1) {
            const elm = node as Element;

            // parse node what will need to have their content updated
            // this can be done only on the first level o nodes because
            // they will still container the template that need to be parsed
            if (elm.innerHTML.match(/{{.+}}/)) {
              this.nodes.push({
                node: elm,
                template: (node as Element).innerHTML
              });
            }

          }

        });

        // this need to be done elm by elm
        this.shadowRoot.querySelectorAll('*').forEach((elm) => {
          [...elm.attributes].forEach((attribute) => {
            // parse attributes that will need to be updated
            if (attribute.nodeValue.match(/{{.+}}/)) {
              this.mappedAttributes.push({
                attribute,
                template: attribute.nodeValue
              });
            }

            // parse directives
            if (attribute.name[0] === '#') {
              debugger;
              const name = attribute.name.slice(1);
              this.nodesWithDirectives.push({
                node: elm,
                directive: directives[name],
                // this is the property that will be assigned from the controller
                property: attribute.value
              })
            }

          });

        })


        // todo see if we can do this before appending child to shadowRoot
        // bind events now
        // scan all child node for bindings
        this.nodesWithCallableAttributes = getNodesWithCallableAttributes(this.shadowRoot.children);

        this.nodesWithCallableAttributes.forEach(({node, name, value}) => {
          node.addEventListener(name, (event) => {
            this.controller[value].apply(this.controller, [event]);
          });
        });

        this.render();

        this.controller.events.on('changed', () => {
          this.render();
        });
      }

      attributeChangedCallback(name, oldValue, newValue) {

        if (oldValue !== newValue) {
          console.log('attribute updated');
          this.controller[name] = newValue;
          this.render();
        }
      }

      private render() {

        if (options.template) {

          this.nodes.forEach(({node, template}) => {
            node.innerHTML = Mustache.render(template, this.controller);
          });

          this.mappedAttributes.forEach(({attribute, template}) => {
            attribute.value = Mustache.render(template, this.controller);
          });

          this.nodesWithDirectives.forEach(({node, directive, property}) => {
            directive.apply(this.controller, [node, this.controller[property]])
          })

        }

        if (typeof this.controller.render === 'function') {
          this.shadowRoot.innerHTML = this.controller.render();
        }
      }
    })
  };
}

export function getComponentMetadata(target): Options {
  return Reflect.getMetadata(ComponentSymbol, target);
}


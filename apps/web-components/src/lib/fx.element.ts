import { getDebugger } from '@microgamma/loggator';
import { getComponentMetadata, Options } from './component';
import { Subject, takeUntil } from 'rxjs';
import { generateUUID, getChildrenWithBoundAttributes, getNodesWithCallableAttributes, getNodesWithVariables } from './utilities';
import { parseTemplate } from './parseTemplate';
import Mustache from 'mustache';

const d = getDebugger('web-components:fx.element')

export interface OnDestroy {
  fxOnDestroy(): void;
}

export interface OnInit {
  fxOnInit(): void;
}

export interface Internals extends ElementInternals {
  states: Set<any>
}

export abstract class FxElement extends HTMLElement {
  private nodesWithVariables: {
    node: ChildNode;
    template: string;
    assignedVariable: string;
  }[] = [];
  private childrenWithBoundAttributes: any;


  static get observedAttributes(): string[] {
    const meta = getComponentMetadata(this);
    return meta.inputs;
  }

  public readonly uid: string = generateUUID();
  public metadata: Options = getComponentMetadata(this.constructor);

  protected destroy$: Subject<void> = new Subject<void>();

  private changed$: Subject<{ name: string, value: any; }> = new Subject<{ name: string; value: any; }>();
  private nodesWithCallableAttributes: { node: Element; name: string; value: string }[] = [];
  private readonly template: HTMLTemplateElement = document.createElement('template');
  private _internals: Internals = this.attachInternals() as Internals;
  private observer: MutationObserver = new MutationObserver((event) => {
    d('mutation observed', event);
  });

  constructor() {
    super();
    d('constructing',this.metadata.selector, this.uid);
    d('internals', this._internals);

    this.setAttribute(this.uid, '');

    // setup watchers for all @Input[s]
    for (const input of this.metadata.inputs) {
      const accessor = `__${input}__`;

      Object.defineProperty(this, accessor, {
        enumerable: false,
        writable: true,
      })
      Object.defineProperty(this, input, {
        get: function () {
          return this[accessor]
        },
        set: function(value) {
          this[accessor] = value;
          this.changed$.next({
            name: input,
            value
          });
        }
      });
    }

    this.template.innerHTML = this.metadata.template;

    this.attachShadow({mode: 'open'});

    this.changed$.pipe(
      // startWith(''),
      takeUntil(this.destroy$),
    ).subscribe(({name, value}) => {

      // get all changed node and update them
      this.nodesWithVariables
        .filter((n) => n.assignedVariable === name)
        .forEach((n) => {
          n.node.nodeValue = Mustache.render(n.template, this);
        });

      this.childrenWithBoundAttributes?.forEach(({attribute, assignedVariable}) => {
        attribute.value = this[assignedVariable];
      });

    });

  }

  connectedCallback() {
    d(this.tagName, this.uid, 'connected');

    // observe changes
    this.observer.observe(this, {
      childList: true,
      characterData: true,
      subtree: true
    });

    if ( 'fxOnInit' in this) {
      // TODO replace with a type guard
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.fxOnInit();
    }

    // after init phase we attach the template unparsed to the shadow root
    const clone = this.template.content.cloneNode(true);
    // search for nodes that contain a variable
    this.nodesWithVariables = getNodesWithVariables(clone.childNodes);
    d('nodes', this.nodesWithVariables);


    // assign values to nodes
    this.nodesWithVariables.forEach(({node, template, assignedVariable}) => {
      if (!(assignedVariable in this)) {
        console.error('cannot find any variable in', node.nodeValue);
      } else {

        const interpolated = Mustache.render(template, this);

        node.nodeValue = interpolated;
      }
    });



    this.shadowRoot.appendChild(clone);

    this.childrenWithBoundAttributes = getChildrenWithBoundAttributes(this.shadowRoot.children);
    this.childrenWithBoundAttributes.forEach(({attribute, assignedVariable}) => {
      attribute.value = this[assignedVariable];
    });

    // todo see if we can do this before appending child to shadowRoot
    // bind events now
    // scan all child node for bindings
    this.nodesWithCallableAttributes = getNodesWithCallableAttributes(this.shadowRoot.children);

    this.nodesWithCallableAttributes.forEach(({node, name, value}) => {
      node.addEventListener(name, (event) => {
        this[value].apply(this, [event]);
      });
    });

  }

  disconnectedCallback() {
    d(this.tagName, this.uid, 'disconnected');
    this.observer.disconnect();

    // clean up event listeners
    this.nodesWithCallableAttributes.forEach(({node, name, value}) => {
      // node.removeEventListener(name)
    });

    this.destroy$.next();
    this.destroy$.complete();

    if ( 'fxOnDestroy' in this) {
      // TODO replace with a type guard
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.fxOnDestroy();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    d('attribute changed', name, oldValue, newValue);
    // this.render();
    // an attribute changed if that's decorated with @Input a change call must be done

    if(this.metadata.inputs.indexOf(name) >= 0) {
      this[name] = newValue;
    }

  }


  protected render() {
    debugger;

    //
    // const template = parseTemplate(this.metadata.template, this);
    // this.shadowRoot.innerHTML = template;


  }

}

export function html(literals, ...substitutions) {
  let result = '';

  for (let i = 0; i < substitutions.length; i++) {
    result += literals[i];
    result += substitutions[i];
  }
  // add the last literal
  result += literals[literals.length - 1];
  return result;
}



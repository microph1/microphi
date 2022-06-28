import { getComponentMetadata, Options } from './component';
import { Subject } from 'rxjs';
import { generateUUID, getChildrenWithBoundAttributes, getNodesWithCallableAttributes } from './utilities';
import Mustache from 'mustache';
import { Log, Logger } from '@microgamma/loggator';


export interface OnDestroy {
  fxOnDestroy(): void;
}

export interface OnInit {
  fxOnInit(): void;
}

export interface Internals extends ElementInternals {
  states: Set<any>
}

export abstract class Fx2Element extends HTMLElement {

  @Log()
  logger: Logger;
  private childrenWithBoundAttributes: any[];


  public readonly uid: string = generateUUID();
  public metadata: Options = getComponentMetadata(this.constructor);

  static meta;

  // protected destroy$: Subject<void> = new Subject<void>();

  // private changed$: Subject<{ name: string, value: any; }> = new Subject<{ name: string; value: any; }>();
  private nodesWithCallableAttributes: { node: Element; name: string; value: string }[] = [];
  private readonly template: HTMLTemplateElement = document.createElement('template');
  private _internals: Internals = this.attachInternals() as Internals;
  private observer: MutationObserver = new MutationObserver((events) => {
    debugger;

    events.forEach((e) => {
      if (e.type === 'childList') {
        e.addedNodes.forEach((value, key, parent) => {
          debugger

        });
      }

    });
  });

  constructor() {
    super();
    this.log('constructing', Fx2Element.meta, this.uid);

    this.setAttribute(this.uid, '');

    this.template.innerHTML = this.metadata.template;

    const registeredDirectives = ['[fxFor]'];


    this.attachShadow({mode: 'open'});

  }

  connectedCallback() {
    this.log(this.tagName, this.uid, 'connected');

    // observe changes
    this.observer.observe(this.shadowRoot, {
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

    debugger;

  }

  disconnectedCallback() {
    this.log(this.tagName, this.uid, 'disconnected');
    this.observer.disconnect();

    // clean up event listeners
    this.nodesWithCallableAttributes.forEach(({node, name, value}) => {
      // node.removeEventListener(name)
    });

    if ( 'fxOnDestroy' in this) {
      // TODO replace with a type guard
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.fxOnDestroy();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.log('attribute changed', name, oldValue, newValue);
    // this.render();
    // an attribute changed if that's decorated with @Input a change call must be done

    if(this.metadata.inputs.indexOf(name) >= 0) {
      this[name] = newValue;
    }



    // assign values to nodes
    // this.nodesWithVariables.forEach(({node, template, assignedVariable}) => {
    //   if (!(assignedVariable in this)) {
    //     console.error('cannot find any variable in', node.nodeValue);
    //   } else {
    //
    //
    //     const interpolated = Mustache.render(template, this);
    //
    //     node.nodeValue = interpolated;
    //   }
    // });

  }

  protected log(...msg: any[]) {
    return console.log(...msg);
  }
}

export const _html = (data) => html;

export function html(literals, ...substitutions) {
  let result = '';

  debugger;
  for (let i = 0; i < substitutions.length; i++) {
    result += literals[i];
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    result += '<!-- comment unique id -->' + substitutions[i];
  }
  // add the last literal
  result += literals[literals.length - 1];
  return result;
}
